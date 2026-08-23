import type { GuidedInterviewQuestion, PropertyCategoryId } from './types';

export const GUIDED_INTERVIEW_POLICY = {
  mode: 'structured-guided-interviews',
  openEndedAiChat: false,
  rule: 'Each answer determines the next relevant question. Questions that do not apply must not appear.'
} as const;

export const FOUNDATION_GUIDED_QUESTIONS: readonly GuidedInterviewQuestion[] = [
  {
    id: 'category',
    label: 'What type of space are you looking for?',
    helperText: 'Choose one rental category so we can ask only relevant questions.',
    appliesTo: ['houses', 'shops', 'offices', 'event-halls'],
    options: ['Houses', 'Shops', 'Offices', 'Event Halls']
  },
  {
    id: 'house-type',
    label: 'Which house type do you prefer?',
    helperText: 'This appears only for residential searches.',
    appliesTo: ['houses'],
    options: [
      'Single Room',
      'Bedsitter',
      'One Bedroom',
      'Two Bedroom',
      'Three Bedroom',
      'Four Bedroom',
      'Five Bedroom',
      'Mixed residential property'
    ]
  },
  {
    id: 'shop-suitability',
    label: 'What kind of business should the shop support?',
    helperText: 'This appears only for shop searches.',
    appliesTo: ['shops'],
    options: ['Retail', 'Salon or barber', 'Food business', 'General services', 'Other business']
  },
  {
    id: 'office-type',
    label: 'What office setup do you need?',
    helperText: 'This appears only for office searches.',
    appliesTo: ['offices'],
    options: ['Private office', 'Shared office', 'Small team office', 'Large office']
  },
  {
    id: 'event-suitability',
    label: 'What event should the hall support?',
    helperText: 'This appears only for event hall searches.',
    appliesTo: ['event-halls'],
    options: ['Wedding', 'Meeting', 'Training', 'Church event', 'Party', 'Community event']
  },
  {
    id: 'location',
    label: 'Where in Kenya should we search?',
    helperText: 'Search by county, town, estate, suburb, market centre, or village.',
    appliesTo: ['houses', 'shops', 'offices', 'event-halls']
  },
  {
    id: 'budget',
    label: 'What monthly budget range works for you?',
    helperText: 'Use Kenya Shillings so matches stay practical and clear.',
    appliesTo: ['houses', 'shops', 'offices', 'event-halls']
  }
] as const;

export function getQuestionsForCategory(category: PropertyCategoryId): readonly GuidedInterviewQuestion[] {
  return FOUNDATION_GUIDED_QUESTIONS.filter((question) => question.appliesTo.includes(category));
}
