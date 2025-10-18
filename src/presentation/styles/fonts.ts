import { useFonts, Mogra_400Regular } from '@expo-google-fonts/mogra';

export const useAppFonts = () => {
  const [fontsLoaded] = useFonts({
    Mogra_400Regular,
  });

  return fontsLoaded;
};

export const fonts = {
  mogra: 'Mogra_400Regular',
};
