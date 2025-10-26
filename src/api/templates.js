import API from './axiosInstance'

// Get all templates
export const fetchTemplates = async () => {
  const { data } = await API.get('/templates')
  return data
}

// Create template
export const createTemplate = async (templateData) => {
  const { data } = await API.post('/templates', templateData)
  return data
}

// Delete template
export const deleteTemplate = async (id) => {
  const { data } = await API.delete(`/templates/${id}`)
  return data
}
