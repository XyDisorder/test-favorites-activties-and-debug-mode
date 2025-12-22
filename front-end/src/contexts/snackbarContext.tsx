import { Notification } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { createContext, useEffect, useState } from "react";

interface SnackbarContextType {
  error: (message: string) => void;
  success: (message: string) => void;
}

interface Snackbar {
  message: string;
  type: "error" | "success";
}

export const SnackbarContext = createContext<SnackbarContextType>({
  error: () => {},
  success: () => {},
});

export const SnackbarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [snackbar, setSnackbar] = useState<Snackbar | null>(null);

  const error = (message: string) => {
    // Only log in development
    if (process.env.NODE_ENV === "development") {
      console.error(message);
    }
    setSnackbar({ message, type: "error" });
  };

  const success = (message: string) => {
    setSnackbar({ message, type: "success" });
  };

  useEffect(() => {
    if (snackbar) {
      setTimeout(() => {
        setSnackbar(null);
      }, 1000);
    }
  }, [snackbar]);

  return (
    <SnackbarContext.Provider value={{ success, error }}>
      {children}
      {snackbar && (
        <Notification
          icon={<IconX size="1.1rem" />}
          color={snackbar.type === "error" ? "red" : "green"}
          style={{ position: "fixed", right: 10, bottom: 10, zIndex: 999 }}
        >
          {snackbar.message}
        </Notification>
      )}
    </SnackbarContext.Provider>
  );
};
