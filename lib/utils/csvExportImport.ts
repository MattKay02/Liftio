import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { buildExportCSV } from '@/lib/utils/csv';
import { getAllWorkouts, getCustomTemplates } from '@/lib/database/queries/workouts';
import { getAllExercises } from '@/lib/database/queries/exerciseLibrary';

export const exportWorkoutData = async (): Promise<void> => {
  const completedWorkouts = getAllWorkouts(9999);
  const templates = getCustomTemplates();
  const allWorkouts = [...completedWorkouts, ...templates];

  if (allWorkouts.length === 0) {
    Alert.alert('No Data', 'There are no workouts to export.');
    return;
  }

  const allExercises = getAllExercises();
  const customExercises = allExercises.filter((e) => e.isCustom);

  const csvString = buildExportCSV(allWorkouts, customExercises);

  const file = new File(Paths.cache, 'liftio-export.csv');
  if (file.exists) {
    file.delete();
  }
  file.create();
  file.write(csvString);

  await Sharing.shareAsync(file.uri, {
    mimeType: 'text/csv',
    dialogTitle: 'Export Workout Data',
  });
};
