import { Query, SortOrder } from 'mongoose'

export type SortOption<T = { [key: string]: unknown }> = { [K in keyof T]: SortOrder }
export type SelectOption = Parameters<typeof Query.prototype.select>[0]
export type PopulateOption = Parameters<typeof Query.prototype.populate>[0]
export type QueryOptions<DocType = { [key: string]: unknown }> = {
  sort?: SortOption<Partial<DocType>> | string
  skip?: number
  page?: number
  limit?: number
  select?: SelectOption
  populate?: PopulateOption
  lean?: boolean
  checkPaginate?: boolean
}
export type PaginateResult<T> = {
  data: T[]
  totalPages?: number
}
