import { Module } from '@nestjs/common';

import { ActivateOrganizationModule } from './ActivateOrganization/activate-organization.module';
import { CreateOrganizationModule } from './CreateOrganization/create-organization.module';
import { DeactivateOrganizationModule } from './DeactivateOrganization/deactivate-organization.module';
import { GetEmbedSettingsModule } from './GetEmbedSettings/get-embed-settings.module';
import { GetOrganizationModule } from './GetOrganization/get-organization.module';
import { ListOrganizationsModule } from './ListOrganizations/list-organizations.module';
import { MembersModule } from './Members/members.module';
import { PublicEmbedModule } from './PublicEmbed/public-embed.module';
import { RegenerateEmbedTokenModule } from './RegenerateEmbedToken/regenerate-embed-token.module';
import { UpdateEmbedSettingsModule } from './UpdateEmbedSettings/update-embed-settings.module';

@Module({
  imports: [
    CreateOrganizationModule,
    ListOrganizationsModule,
    GetOrganizationModule,
    GetEmbedSettingsModule,
    UpdateEmbedSettingsModule,
    RegenerateEmbedTokenModule,
    PublicEmbedModule,
    ActivateOrganizationModule,
    DeactivateOrganizationModule,
    MembersModule,
  ],
  exports: [
    CreateOrganizationModule,
    ListOrganizationsModule,
    GetOrganizationModule,
    GetEmbedSettingsModule,
    UpdateEmbedSettingsModule,
    RegenerateEmbedTokenModule,
    PublicEmbedModule,
    ActivateOrganizationModule,
    DeactivateOrganizationModule,
    MembersModule,
  ],
})
export class OrganizationModule {}
