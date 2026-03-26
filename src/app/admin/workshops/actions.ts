'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function createWorkshop(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const title = formData.get('title') as string
  const subtitle = formData.get('subtitle') as string
  if (!title?.trim()) {
    return { error: 'Title is required' }
  }

  const { error } = await supabase.from('workshops').insert({ title: title.trim(), subtitle: subtitle?.trim() || null })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/workshops')
  redirect('/admin/workshops')
}

export async function updateWorkshop(id: string, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const title = formData.get('title') as string
  const subtitle = formData.get('subtitle') as string
  if (!title?.trim()) {
    return { error: 'Title is required' }
  }

  const { error } = await supabase
    .from('workshops')
    .update({ title: title.trim(), subtitle: subtitle?.trim() || null })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/workshops/${id}`)
  revalidatePath('/admin/workshops')
  redirect(`/admin/workshops/${id}`)
}

export async function deleteWorkshop(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.from('workshops').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/workshops')
  redirect('/admin/workshops')
}

export async function createDurchfuehrung(workshopId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.from('durchfuehrungen').insert({
    workshop_id: workshopId,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/workshops/${workshopId}`)
}

export async function deleteDurchfuehrung(id: string, workshopId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.from('durchfuehrungen').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/workshops/${workshopId}`)
}

export async function createTermin(durchfuehrungId: string, workshopId: string, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const date = formData.get('date') as string
  const startTime = formData.get('start_time') as string
  const endTime = formData.get('end_time') as string

  if (!date || !startTime || !endTime) {
    return { error: 'Datum, Start- und Endzeit sind erforderlich' }
  }

  const start_datetime = `${date}T${startTime}`
  const end_datetime = `${date}T${endTime}`

  const { error } = await supabase.from('termine').insert({
    durchfuehrung_id: durchfuehrungId,
    start_datetime,
    end_datetime,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/workshops/${workshopId}`)
}

export async function updateTermin(
  id: string,
  workshopId: string,
  formData: FormData
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const date = formData.get('date') as string
  const startTime = formData.get('start_time') as string
  const endTime = formData.get('end_time') as string

  if (!date || !startTime || !endTime) {
    return { error: 'Datum, Start- und Endzeit sind erforderlich' }
  }

  const start_datetime = `${date}T${startTime}`
  const end_datetime = `${date}T${endTime}`

  const { error } = await supabase
    .from('termine')
    .update({ start_datetime, end_datetime })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/workshops/${workshopId}`)
}

export async function deleteTermin(id: string, workshopId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.from('termine').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/workshops/${workshopId}`)
}
