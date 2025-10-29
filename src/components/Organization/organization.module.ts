import { Module } from '@nestjs/common';

import { CreateOrganizationModule } from './CreateOrganization/create-organization.module';
import { GetEmbedSettingsModule } from './GetEmbedSettings/get-embed-settings.module';
import { GetOrganizationModule } from './GetOrganization/get-organization.module';
import { ListOrganizationsModule } from './ListOrganizations/list-organizations.module';
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
  ],
  exports: [
    CreateOrganizationModule,
    ListOrganizationsModule,
    GetOrganizationModule,
    GetEmbedSettingsModule,
    UpdateEmbedSettingsModule,
    RegenerateEmbedTokenModule,
    PublicEmbedModule,
  ],
})
export class OrganizationModule {}
