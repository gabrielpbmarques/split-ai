import { Module } from '@nestjs/common';

import { ActivateOrganizationModule } from 'src/modules/organizations/activate-organization/activate-organization.module';
import { CreateOrganizationModule } from 'src/modules/organizations/create-organization/create-organization.module';
import { DeactivateOrganizationModule } from 'src/modules/organizations/deactivate-organization/deactivate-organization.module';
import { GetEmbedPageModule } from 'src/modules/organizations/get-embed-page/get-embed-page.module';
import { GetEmbedScriptModule } from 'src/modules/organizations/get-embed-script/get-embed-script.module';
import { GetEmbedSettingsModule } from 'src/modules/organizations/get-embed-settings/get-embed-settings.module';
import { GetOrganizationModule } from 'src/modules/organizations/get-organization/get-organization.module';
import { ListOrganizationsModule } from 'src/modules/organizations/list-organizations/list-organizations.module';
import { RegenerateEmbedTokenModule } from 'src/modules/organizations/regenerate-embed-token/regenerate-embed-token.module';
import { UpdateEmbedSettingsModule } from 'src/modules/organizations/update-embed-settings/update-embed-settings.module';

@Module({
  imports: [
    ActivateOrganizationModule,
    CreateOrganizationModule,
    DeactivateOrganizationModule,
    GetEmbedSettingsModule,
    GetOrganizationModule,
    ListOrganizationsModule,
    GetEmbedPageModule,
    GetEmbedScriptModule,
    RegenerateEmbedTokenModule,
    UpdateEmbedSettingsModule,
  ],
  exports: [
    ActivateOrganizationModule,
    CreateOrganizationModule,
    DeactivateOrganizationModule,
    GetEmbedSettingsModule,
    GetOrganizationModule,
    ListOrganizationsModule,
    GetEmbedPageModule,
    GetEmbedScriptModule,
    RegenerateEmbedTokenModule,
    UpdateEmbedSettingsModule,
  ],
})
export class OrganizationsModule {}
