import { apiFetch } from "../utils/api-client";
import { AppError } from "../types";
import { useCallback, useEffect, useRef, useState } from "react";
import logger from "../utils/logger";

type MutationStatus = "idle" | "pending" | "error" | "success";

interface MutationOptions<TData> {
  headers?: Record<string, string>;
  method?: "POST" | "PUT" | "DELETE" | "PATCH";
  onError?: (error: AppError) => void;
  onSuccess?: (data: TData) => void;
  retry?: number;
}

interface MutationResult<TData, TVariables> {
  data: TData | undefined;
  error: AppError | null;
  isError: boolean;
  isPending: boolean;
  isPendingId: (id: number) => boolean;
  isSuccess: boolean;
  mutate: (variables: TVariables) => Promise<TData | undefined>;
  reset: () => void;
}

const DEFAULT_RETRY_COUNT = 0;

const DEFAULT_OPTIONS: MutationOptions<unknown> = {
  headers: {},
  method: "POST",
  retry: DEFAULT_RETRY_COUNT,
};

export default function useMutation<TData = unknown, TVariables = unknown>(
  mutateUrl: string | ((variables: TVariables) => string),
  options: Partial<MutationOptions<TData>> = {},
): MutationResult<TData, TVariables> {
  const [data, setData] = useState<TData | undefined>();
  const [status, setStatus] = useState<MutationStatus>("idle");
  const [error, setError] = useState<AppError | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const reset = useCallback(() => {
    setData(undefined);
    setStatus("idle");
    setError(null);
  }, []);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | undefined> => {
      const mergedOptions = { ...DEFAULT_OPTIONS, ...optionsRef.current };
      const {
        headers = {},
        method = "POST",
        onError,
        onSuccess,
        retry = DEFAULT_RETRY_COUNT,
      } = mergedOptions;

      if (typeof variables === "number") {
        setActiveId(variables);
      }

      let retryCount = 0;

      const finalUrl =
        typeof mutateUrl === "function" ? mutateUrl(variables) : mutateUrl;
      const baseUrl = `${import.meta.env.VITE_API_URL}/api/v1/${finalUrl.replace(/^\//, "")}`;

      setStatus("pending");
      setError(null);

      const performMutation = async (): Promise<TData | undefined> => {
        try {
          const result = await apiFetch<TData>(baseUrl, {
            method,
            headers: {
              "Content-Type": "application/json",
              ...headers,
            },
            body:
              method !== "DELETE" && variables
                ? JSON.stringify(variables)
                : undefined,
          });

          setData(result);
          setStatus("success");
          setActiveId(null);
          onSuccess?.(result);

          return result;
        } catch (error) {
          if (retryCount < retry) {
            retryCount++;
            const delay = Math.pow(2, retryCount - 1) * 1000;
            logger.debug(
              `Mutation retry ${retryCount}/${retry} for ${baseUrl} in ${delay}ms`,
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            return performMutation();
          }

          const appError = error as AppError;

          if (retryCount >= retry) {
            setActiveId(null);
          }

          setError(appError);
          setStatus("error");
          onError?.(appError);

          throw appError;
        }
      };

      return performMutation();
    },
    [mutateUrl],
  );

  const isPendingId = useCallback(
    (id: number) => status === "pending" && activeId === id,
    [status, activeId],
  );

  return {
    data,
    error,
    isError: status === "error",
    isPending: status === "pending",
    isPendingId,
    isSuccess: status === "success",
    mutate,
    reset,
  };
}
