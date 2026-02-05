import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import React from "react";
import ReactDOM from "react-dom/client";
import {
  ParticipantProvider as ApiParticipantProvider,
  StudyProvider,
} from "@rssa-project/api";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";
import { ParticipantProvider } from "@rssa-project/api";
import reportWebVitals from "./reportWebVitals";

const RSSA_API_DEV = import.meta.env.VITE_RSSA_API_DEV!;
const RSSA_API = import.meta.env.VITE_RSSA_API!;
const RSSA_STUDY_ID = import.meta.env.VITE_RSSA_STUDY_ID!;
const RSSA_API_KEY_ID = import.meta.env.VITE_RSSA_API_KEY_ID!;
const RSSA_API_KEY_SECRET = import.meta.env.VITE_RSSA_API_KEY_SECRET!;

const api_url_base =
  process.env.NODE_ENV === "development" ? RSSA_API_DEV : RSSA_API;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

const localStoragePersister = createAsyncStoragePersister({
  storage: {
    getItem: (key) => Promise.resolve(localStorage.getItem(key)),
    setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
    removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
  },
});
const providerConfig = {
  apiUrlBase: api_url_base,
  studyId: RSSA_STUDY_ID,
  apiKeyId: RSSA_API_KEY_ID,
  apiKeySecret: RSSA_API_KEY_SECRET,
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: localStoragePersister }}
    >
      <ApiParticipantProvider>
        <StudyProvider config={providerConfig}>
          <ParticipantProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
            <ReactQueryDevtools initialIsOpen={false} />
          </ParticipantProvider>
        </StudyProvider>
      </ApiParticipantProvider>
    </PersistQueryClientProvider>
  </React.StrictMode>,
);

reportWebVitals(console.log);
