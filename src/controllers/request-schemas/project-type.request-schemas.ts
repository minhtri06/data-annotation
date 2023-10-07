export type CreateProjectType = {
  body: {
    name: string
  }
}

export type UpdateProjectTypeById = {
  params: {
    projectTypeId: string
  }
  body: {
    name?: string
  }
}

export type DeleteProjectTypeById = {
  params: {
    projectTypeId: string
  }
}
