import * as React from 'react';
import { Dialog, Tab } from '@headlessui/react';
import { useHotkeys } from 'react-hotkeys-hook';
import { SearchIcon } from '@heroicons/react/outline';

type searchRequest = {
  query: string;
  max_results: string;
};

type searchResponse = {
  id: string;
  documents: [
    {
      id: string;
      title: string;
      url: string;
      snippet: string;
    }
  ];
};

type feedbackRequest = {
  search_id: string;
  document_id: string;
};

// Props for the SearchBar component.
export type OperandSearchProps = {
  apiKey: string;
  clickableChild?: React.ReactNode;
  disableFeedback?: boolean;
  placeholderText?: string;
  keyboardShortcut?: string;
};

export const OperandSearch: React.FC<OperandSearchProps> = (
  props: OperandSearchProps
) => {
  const {
    apiKey,
    clickableChild,
    disableFeedback,
    placeholderText,
    keyboardShortcut,
  } = props;
  // States
  // Controls whether the search modal is shown.
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<searchResponse>();

  // Sets keyboard shortcut hook
  if (keyboardShortcut) {
    useHotkeys(keyboardShortcut, () => {
      setOpen(true);
    });
  }

  // Functions
  // Handles closing the search modal.
  const handleClose = async () => {
    setOpen(false);
  };
  // Handles the search query.
  const doSearch = async () => {
    setResults(undefined);
    // If the search query is empty, do nothing.
    if (query === '') {
      return;
    }
    const searchRequest: searchRequest = {
      query,
      max_results: '5',
    };

    const response = await fetch(
      'https://wopr-api.operand.ai/services.ops.v1.OpsService/SearchDocuments',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${apiKey}`,
        },
        body: JSON.stringify(searchRequest),
      }
    );

    if (response.ok) {
      const searchResponse = await response.json();
      setResults(searchResponse);
    }
  };

  const logFeedback = async (documentId: string) => {
    if (!results || disableFeedback) {
      return;
    }
    const feedbackRequest: feedbackRequest = {
      search_id: results.id,
      document_id: documentId,
    };

    const response = await fetch(
      'https://wopr-api.operand.ai/services.ops.v1.OpsService/Feedback',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${apiKey}`,
        },
        body: JSON.stringify(feedbackRequest),
      }
    );
  };

  return (
    <>
      {/* The modal. */}
      <Dialog
        open={open}
        onClose={handleClose}
        className="fixed z-10 inset-0 py-14"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="flex w-full h-4/5 items-center justify-center">
            <div className="mx-auto max-w-7xl w-full sm:w-4/5 bg-white p-6 shadow-lg rounded-lg">
              {/* Search Bar */}
              <div className="flex items-center justify-center px-2 sm:px-6">
                <SearchIcon className="w-6 h-6 text-gray-600" />
                <div className="flex ml-4 flex-col justify-center flex-1">
                  <input
                    className="flex appearance-none bg-transparent border-none w-full text-gray-700 mr-3 placeholder-gray-600 rounded-none leading-tight focus:outline-none text-lg"
                    type="text"
                    placeholder={placeholderText ?? 'discover something new'}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyUp={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.currentTarget.blur();
                        doSearch();
                      }
                    }}
                    enterKeyHint="search"
                  />
                </div>
              </div>
              {/* Results */}
              {results && (
                <div className="mt-6 max-h-96 overflow-y-auto">
                  <div className="hidden sm:block">
                    <Tab.Group vertical={true}>
                      <div className=" sm:grid sm:grid-cols-3 sm:gap-4">
                        <h3 className="ml-4 sm:prose lg:prose-lg col-span-3">
                          results:
                        </h3>
                        <Tab.List
                          as="div"
                          className="col-span-1 py-3"
                          id="operand-results"
                        >
                          {results.documents.map((document) => (
                            <Tab as={React.Fragment}>
                              {({ selected }) => (
                                <div
                                  onKeyUp={(e) => {
                                    if (selected && e.key === 'Enter') {
                                      logFeedback(document.id);
                                      window.location.href = document.url;
                                    }
                                  }}
                                  key={document.id}
                                  className={`${
                                    selected
                                      ? 'border-l-2 border-black shadow-lg'
                                      : ''
                                  } flex ml-1 items-center justify-between rounded px-4 py-2 focus:outline-none font-normal`}
                                >
                                  <div className="flex items-center sm:prose lg:prose-lg">
                                    {document.title}
                                  </div>
                                </div>
                              )}
                            </Tab>
                          ))}
                        </Tab.List>
                        <Tab.Panels className="col-span-2">
                          {results.documents.map((document) => (
                            <Tab.Panel
                              className="hover:cursor-pointer"
                              onClick={() => {
                                logFeedback(document.id);
                                window.open(document.url, '_blank');
                              }}
                            >
                              <article
                                key={document.id}
                                className="prose-sm sm:prose lg:prose-lg"
                              >
                                {document.snippet}
                              </article>
                            </Tab.Panel>
                          ))}
                        </Tab.Panels>
                      </div>
                    </Tab.Group>
                  </div>

                  <ul className="block sm:hidden">
                    {results.documents.map((document) => (
                      <li
                        key={document.id}
                        className="hover:cursor-pointer rounded px-4 py-2 focus:outline-none"
                        onClick={() => {
                          logFeedback(document.id);
                          window.open(document.url, '_blank');
                        }}
                      >
                        <article className="prose-sm">
                          <h3>{document.title}</h3>
                          <p className="line-clamp-4">{document.snippet}</p>
                        </article>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </Dialog>
      {/* Clickable content, e.g. a fake search bar. */}
      {clickableChild && (
        <div
          className="hover:cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
        >
          {clickableChild}
        </div>
      )}
    </>
  );
};
