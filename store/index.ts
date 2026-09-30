export * from './slice/blogSlice';
export * from './slice/chatSlice';
export * from './slice/connectorSlice';
export * from './slice/pluginSlice';
export * from './slice/projectSlice';
export * from './slice/skillSlice';
export * from './slice/userSlice';

export interface AppStoreState {
  blog: import('./slice/blogSlice').BlogSliceState;
  chats: import('./slice/chatSlice').ChatSliceState;
  connector: import('./slice/connectorSlice').ConnectorSliceState;
  plugin: import('./slice/pluginSlice').PluginSliceState;
  project: import('./slice/projectSlice').ProjectSliceState;
  skill: import('./slice/skillSlice').SkillSliceState;
  user: import('./slice/userSlice').UserSliceState;
}

export const initialAppStoreState = {
  blog: { items: [], selected: null, loading: false, error: null },
  chats: {
    chats: [],
    selectedChat: null,
    renamingChatId: null,
    isWriting: false,
    isLoading: false,
  },
  connector: { items: [], selected: null, loading: false, error: null },
  plugin: { items: [], selected: null, loading: false, error: null },
  project: { items: [], selected: null, loading: false, error: null },
  skill: { items: [], selected: null, loading: false, error: null },
  user: { profile: null, isAuthenticated: false, loading: false, error: null },
};
