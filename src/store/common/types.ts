export interface CommonState {
  route: any | null
  tiers: any[]
  errorMsg: string | null
  successMsg: string | null
  showLoadingSpinner: boolean
  alternateBackground: boolean
  loadingSpinnerMsg: string
  userTiers: number
}
