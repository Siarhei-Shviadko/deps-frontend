
import { SYSTEM_EMAIL } from '@/constants/common'
import { InviteesFilterKeys, OrgWaitingsFilterKeys, PaginationKeys } from '@/constants/navigation'
import { AuthType } from '@/enums/AuthType'
import { localize, Localization } from '@/localization/i18n'
import { Organisation } from '@/models/Organisation'
import { User } from '@/models/User'
import { apiMap } from '@/utils/apiMap'
import { apiRequest } from '@/utils/apiRequest'
import { ENV } from '@/utils/env'

const FILTER_CONFIG_TO_SEARCH_PARAMS_MAPPING = {
  [InviteesFilterKeys.EMAIL]: 'email',
  [OrgWaitingsFilterKeys.USER]: 'fullName',
  SORT: 'sortBy',
}

const getUser = async (userId) => {
  const profile = await apiRequest.get(apiMap.apiGatewayV2.v5.iam.users.user(userId))

  return {
    [userId]: (
      new User(
        profile.email ?? '',
        profile.firstName ?? '',
        profile.lastName ?? '',
        null,
        profile.username,
      )
    ),
  }
}

const getMe = () => {
  if (ENV.AUTH_TYPE === AuthType.NO_AUTH) {
    return new User(
      SYSTEM_EMAIL,
      localize(Localization.DEFAULT_FIRST_NAME),
      localize(Localization.UNKNOWN_LAST_NAME),
      new Organisation(
        '1111',
        'Organisation',
      ),
      'SystemUser',
      '1111-1111-1111-1111',
    )
  }

  return apiRequest.get(apiMap.apiGatewayV2.v5.iam.users.me())
}

const getOrganisations = () => {
  if (ENV.AUTH_TYPE === AuthType.NO_AUTH) {
    return {
      organisations: [
        new Organisation(
          '1111',
          'Organisation',
        ),
      ],
    }
  }

  return apiRequest.get(apiMap.apiGatewayV2.v5.iam.organisations())
}

const activateUserOrganisation = (orgPk) => apiRequest.post(apiMap.apiGatewayV2.v5.iam.organisation.activate(orgPk))

const updateOrganisation = (orgPk, name) => apiRequest.patch(apiMap.apiGatewayV2.v5.iam.organisation(orgPk), {
  name,
})

const inviteUsers = (emails, orgPk) => apiRequest.post(apiMap.apiGatewayV2.v5.iam.organisation.invite(orgPk), emails)

const invitedUsers = (orgPk, filters) => {
  const mappedFilter = {
    [PaginationKeys.PAGE]: filters.page,
    [PaginationKeys.PER_PAGE]: filters.perPage,
    [FILTER_CONFIG_TO_SEARCH_PARAMS_MAPPING[InviteesFilterKeys.EMAIL]]: filters.email,
    [FILTER_CONFIG_TO_SEARCH_PARAMS_MAPPING.SORT]: filters.sortDirect && `${FILTER_CONFIG_TO_SEARCH_PARAMS_MAPPING[filters.sortField]}.${filters.sortDirect}`,
  }
  return apiRequest.get(apiMap.apiGatewayV2.v5.iam.organisation.invitees(orgPk, mappedFilter))
}

const join = (orgPk) => apiRequest.post(apiMap.apiGatewayV2.v5.iam.organisation.join(orgPk))

const waitingForApproval = (orgPk, filters) => {
  const mappedFilter = {
    [PaginationKeys.PAGE]: filters.page,
    [PaginationKeys.PER_PAGE]: filters.perPage,
    [FILTER_CONFIG_TO_SEARCH_PARAMS_MAPPING[OrgWaitingsFilterKeys.USER]]: filters.user,
    [FILTER_CONFIG_TO_SEARCH_PARAMS_MAPPING.SORT]: filters.sortDirect && `${FILTER_CONFIG_TO_SEARCH_PARAMS_MAPPING[filters.sortField]}.${filters.sortDirect}`,
  }
  return apiRequest.get(apiMap.apiGatewayV2.v5.iam.organisation.approvals(orgPk, mappedFilter))
}

const approveUsers = (userIds, orgPk) => apiRequest.post(apiMap.apiGatewayV2.v5.iam.organisation.approve(orgPk), { userIds })

const declineWaitingUsers = (userIds, orgPk) => apiRequest.delete(apiMap.apiGatewayV2.v5.iam.organisation.approvals(orgPk), { data: { userIds } })

const declineInvitedUsers = (invitees, orgPk) => apiRequest.delete(apiMap.apiGatewayV2.v5.iam.organisation.invitees(orgPk), { data: { invitees } })

export {
  getMe,
  getUser,
  getOrganisations,
  activateUserOrganisation,
  updateOrganisation,
  inviteUsers,
  invitedUsers,
  join,
  waitingForApproval,
  approveUsers,
  declineWaitingUsers,
  declineInvitedUsers,
}
