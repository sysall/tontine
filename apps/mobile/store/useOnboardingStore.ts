import { create } from 'zustand';

interface OnboardingState {
  currentSlideIndex: number;
  isCompleted: boolean;
  setSlideIndex: (index: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  completeOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  currentSlideIndex: 0,
  isCompleted: false,
  setSlideIndex: (index: number) => set({ currentSlideIndex: index }),
  nextSlide: () => {
    const { currentSlideIndex } = get();
    if (currentSlideIndex < 2) {
      set({ currentSlideIndex: currentSlideIndex + 1 });
    }
  },
  prevSlide: () => {
    const { currentSlideIndex } = get();
    if (currentSlideIndex > 0) {
      set({ currentSlideIndex: currentSlideIndex - 1 });
    }
  },
  completeOnboarding: () => set({ isCompleted: true }),
}));
