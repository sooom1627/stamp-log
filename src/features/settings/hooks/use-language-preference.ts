import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  applyLanguagePreference,
  readLanguagePreference,
  type LanguagePreference,
} from "@/shared/i18n/language-preference";

const languagePreferenceQueryKey = ["languagePreference"] as const;

export function useLanguagePreference() {
  return useQuery({
    queryKey: languagePreferenceQueryKey,
    queryFn: readLanguagePreference,
  });
}

// Saves the choice and switches every screen to it at once.
export function useChangeLanguage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applyLanguagePreference,
    onSuccess: (_, preference: LanguagePreference) =>
      queryClient.setQueryData(languagePreferenceQueryKey, preference),
  });
}
