import { useToast as useChakraToast, UseToastOptions } from '@chakra-ui/react';

export const useToast = () => {
  const toast = useChakraToast();

  const showToast = (options: UseToastOptions) => {
    const defaultOptions: UseToastOptions = {
      position: 'top',
      duration: 5000,
      isClosable: true,
    };

    return toast({
      ...defaultOptions,
      ...options,
    });
  };

  const success = (title: string, description?: string) => {
    return showToast({
      title,
      description,
      status: 'success',
    });
  };

  const error = (title: string, description?: string) => {
    return showToast({
      title,
      description,
      status: 'error',
    });
  };

  const warning = (title: string, description?: string) => {
    return showToast({
      title,
      description,
      status: 'warning',
    });
  };

  const info = (title: string, description?: string) => {
    return showToast({
      title,
      description,
      status: 'info',
    });
  };

  return {
    showToast,
    success,
    error,
    warning,
    info,
  };
}; 