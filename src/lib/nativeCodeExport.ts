export const EXPO_SUPABASE_CLIENT_CODE = `// lib/supabase.ts
// Production Supabase client for React Native (Expo) with AsyncStorage session persistence
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
`;

export const EXPO_APP_CODE = `// App.tsx - Production React Native (Expo) with NativeWind & Supabase
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  StatusBar,
  useColorScheme,
} from 'react-native';
import { supabase } from './lib/supabase';
import { CheckCircle2, Circle, Clock, Plus, Bell, CheckSquare, Paperclip } from 'lucide-react-native';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

interface Subtask {
  id: string;
  title: string;
  is_completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  subtasks?: Subtask[];
}

export default function App() {
  const systemTheme = useColorScheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>('todo');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // 1. Fetch tasks from Supabase on mount
  useEffect(() => {
    fetchTasks();
    // Realtime channel subscription
    const channel = supabase
      .channel('tasks-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, subtasks(*)')
      .order('position', { ascending: true });
    if (data && !error) setTasks(data);
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    await supabase.from('tasks').update({ status }).eq('id', taskId);
  };

  const toggleSubtask = async (taskId: string, subtaskId: string, currentState: boolean) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks?.map((st) =>
                st.id === subtaskId ? { ...st, is_completed: !currentState } : st
              ),
            }
          : t
      )
    );
    await supabase.from('subtasks').update({ is_completed: !currentState }).eq('id', subtaskId);
  };

  const handleCreateTask = async () => {
    if (!newTitle.trim()) return;
    const newTask = {
      title: newTitle,
      description: newDesc,
      status: selectedStatus,
      priority: 'medium',
      position: tasks.length,
    };
    const { data, error } = await supabase.from('tasks').insert([newTask]).select().single();
    if (data && !error) {
      setTasks((prev) => [...prev, data]);
      setNewTitle('');
      setNewDesc('');
      setIsNewTaskOpen(false);
    }
  };

  const filteredTasks = tasks.filter((t) => t.status === selectedStatus);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar barStyle={systemTheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Top App Bar */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <View>
          <Text className="text-xl font-bold text-slate-900 dark:text-white">TaskFlow</Text>
          <Text className="text-xs text-slate-500">Project Board · Mobile v2.0</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Bell size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Column Tabs (To Do, In Progress, Review, Done) */}
      <View className="flex-row px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        {(['todo', 'in_progress', 'review', 'done'] as TaskStatus[]).map((st) => {
          const count = tasks.filter((t) => t.status === st).length;
          const isActive = selectedStatus === st;
          return (
            <TouchableOpacity
              key={st}
              onPress={() => setSelectedStatus(st)}
              className={\`flex-1 py-2 items-center rounded-lg \${isActive ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''}\`}
            >
              <Text className={\`text-xs font-semibold \${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}\`}>
                {st.replace('_', ' ').toUpperCase()} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => {
          const completedSubs = item.subtasks?.filter((s) => s.is_completed).length || 0;
          const totalSubs = item.subtasks?.length || 0;
          return (
            <TouchableOpacity
              onPress={() => setActiveTask(item)}
              activeOpacity={0.7}
              className="mb-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-base font-semibold text-slate-900 dark:text-white flex-1 pr-2">
                  {item.title}
                </Text>
                <Text className="text-xs font-mono uppercase text-slate-400">{item.priority}</Text>
              </View>

              {item.description ? (
                <Text numberOfLines={2} className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {item.description}
                </Text>
              ) : null}

              {/* Subtask & Due Date row */}
              <View className="flex-row items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                {totalSubs > 0 ? (
                  <View className="flex-row items-center">
                    <CheckSquare size={14} color="#6366f1" />
                    <Text className="text-xs font-mono text-slate-600 dark:text-slate-300 ml-1">
                      {completedSubs}/{totalSubs}
                    </Text>
                  </View>
                ) : (
                  <View />
                )}
                {item.due_date && (
                  <View className="flex-row items-center">
                    <Clock size={13} color="#94a3b8" />
                    <Text className="text-xs text-slate-400 ml-1">
                      {new Date(item.due_date).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => setIsNewTaskOpen(true)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full items-center justify-center shadow-lg shadow-indigo-500/30"
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Sheet Modal for Quick Task Creation */}
      <Modal visible={isNewTaskOpen} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 border-t border-slate-200 dark:border-slate-800">
            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create New Task</Text>
            <TextInput
              placeholder="Task title..."
              value={newTitle}
              onChangeText={setNewTitle}
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl mb-3 text-slate-900 dark:text-white"
            />
            <TextInput
              placeholder="Description (optional)..."
              value={newDesc}
              onChangeText={setNewDesc}
              multiline
              numberOfLines={3}
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 text-slate-900 dark:text-white"
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setIsNewTaskOpen(false)}
                className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 rounded-xl items-center"
              >
                <Text className="font-semibold text-slate-700 dark:text-slate-300">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateTask}
                className="flex-1 py-3 bg-indigo-600 rounded-xl items-center"
              >
                <Text className="font-semibold text-white">Save Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
`;

export const ZUSTAND_STORE_CODE = `// store/useTaskStore.ts
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Task, TaskStatus } from '../types';

interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  activeProject: string;
  fetchTasks: () => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string, current: boolean) => Promise<void>;
  addTask: (task: Partial<Task>) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  activeProject: 'proj-01',

  fetchTasks: async () => {
    set({ isLoading: true });
    const { data } = await supabase
      .from('tasks')
      .select('*, subtasks(*)')
      .order('position', { ascending: true });
    if (data) set({ tasks: data });
    set({ isLoading: false });
  },

  updateTaskStatus: async (taskId, status) => {
    // Optimistic update
    set({
      tasks: get().tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
    });
    await supabase.from('tasks').update({ status }).eq('id', taskId);
  },

  toggleSubtask: async (taskId, subtaskId, current) => {
    set({
      tasks: get().tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks?.map((st) =>
                st.id === subtaskId ? { ...st, is_completed: !current } : st
              ),
            }
          : t
      ),
    });
    await supabase.from('subtasks').update({ is_completed: !current }).eq('id', subtaskId);
  },

  addTask: async (task) => {
    const { data } = await supabase.from('tasks').insert([task]).select('*, subtasks(*)').single();
    if (data) {
      set({ tasks: [...get().tasks, data] });
    }
  },
}));
`;
