import { places } from '@/data/places-seed'
import { Place, PlaceCategory } from '@/types'

export function getAllPlaces(): Place[] {
  return places
}

export function getPlacesByCategory(cat: PlaceCategory): Place[] {
  return places.filter(p => p.category === cat)
}

export function getPlaceById(id: string): Place | undefined {
  return places.find(p => p.id === id)
}
