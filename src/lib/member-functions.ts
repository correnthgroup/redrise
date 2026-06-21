export const MEMBER_FUNCTIONS = ['Owner', 'Board', 'Staff', 'Member', 'Viewer'] as const

export type MemberFunction = typeof MEMBER_FUNCTIONS[number]

export function getMemberFunctionLabelKey(value: string) {
  switch (value) {
    case 'Owner':
      return 'settings.memberFunctionOwner'
    case 'Board':
      return 'settings.memberFunctionBoard'
    case 'Staff':
      return 'settings.memberFunctionStaff'
    case 'Viewer':
      return 'settings.memberFunctionViewer'
    default:
      return 'settings.memberFunctionMember'
  }
}

export function normalizeMemberFunction(value: string | null | undefined): MemberFunction {
  return MEMBER_FUNCTIONS.find((option) => option === value) ?? 'Member'
}
