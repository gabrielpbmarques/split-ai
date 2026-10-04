import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { InviteMemberDto } from 'src/modules/members/invite-member/invite-member.dto';
import { EmailService } from 'src/modules/notifications/email/email.service';
import { OrganizationRepository } from 'src/modules/organizations/repositories/organization.repository';
import { UserRepository } from 'src/modules/users/repositories/user.repository';
import { env } from 'src/shared/config/env';
import { generateInviteToken } from 'src/shared/utils/invite-token';

@Injectable()
export class InviteMemberService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(
    dto: InviteMemberDto,
    organizationId: string,
  ): Promise<{ id: string; email: string; invite_token: string }> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('E-mail já cadastrado');
    }

    await this.assertWithinUserQuota(organizationId);

    const { token, hash } = generateInviteToken();

    const user = await this.userRepository.create({
      name: dto.name ?? dto.email,
      email: dto.email,
      role: 'user',
      org_role: dto.org_role ?? 'member',
      status: 'inactive',
      organization_id: organizationId,
      invite_token_hash: hash,
    });

    await this.sendInviteEmail(dto.email, token);

    return { id: user.id, email: user.email, invite_token: token };
  }

  /**
   * Enforces the organization plan's `max_users` quota. Unlimited plans and
   * plans with a null `max_users` are unbounded.
   */
  private async assertWithinUserQuota(organizationId: string): Promise<void> {
    const organization =
      await this.organizationRepository.findByIdWithPlan(organizationId);
    const plan = organization?.plan;

    if (!plan || plan.unlimited || plan.max_users == null) {
      return;
    }

    const currentUsers =
      await this.userRepository.countByOrganization(organizationId);

    if (currentUsers >= plan.max_users) {
      throw new ForbiddenException(
        'Limite de usuários do seu plano atingido. Faça upgrade para convidar mais membros.',
      );
    }
  }

  private async sendInviteEmail(email: string, token: string): Promise<void> {
    try {
      await this.emailService.send({
        to: email,
        from: env.SENDGRID_EMAIL_DEFAULT_FROM,
        subject: 'Você foi convidado(a) para uma organização',
        text: `Você foi convidado(a). Use o token de convite para definir sua senha: ${token}`,
      });
    } catch {
      // Email delivery is best-effort; the invite token is also returned so the
      // owner/admin can share it manually if needed.
    }
  }
}
