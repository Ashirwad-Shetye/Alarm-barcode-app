import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Switch } from "react-native";
import { Alarm } from "../types";
import { storageService } from "../services/storageService";
import { notificationService } from "../services/notificationService";

export default function HomeScreen({ navigation }: any) {
	const [alarms, setAlarms] = useState<Alarm[]>([]);

	useEffect(() => {
		loadAlarms();
		requestPermissions();
	}, []);

	const requestPermissions = async () => {
		await notificationService.requestPermissions();
	};

	const loadAlarms = async () => {
		const savedAlarms = await storageService.getAlarms();
		setAlarms(savedAlarms);
	};

	const toggleAlarm = async (id: string) => {
		const updatedAlarms = alarms.map((alarm) => {
			if (alarm.id === id) {
				const updated = { ...alarm, enabled: !alarm.enabled };
				// Schedule or cancel based on new state
				if (updated.enabled) {
					notificationService.scheduleAlarm(updated);
				} else if (alarm.notificationId) {
					notificationService.cancelAlarm(alarm.notificationId);
				}
				return updated;
			}
			return alarm;
		});
		setAlarms(updatedAlarms);
		await storageService.saveAlarms(updatedAlarms);
	};

	const deleteAlarm = async (id: string) => {
		const updatedAlarms = alarms.filter((alarm) => alarm.id !== id);
		setAlarms(updatedAlarms);
		await storageService.saveAlarms(updatedAlarms);
	};

	const formatTime = (date: Date) => {
		const d = new Date(date);
		return d.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<View className='flex-1 bg-gray-900 pt-12'>
			<View className='px-6 py-4'>
				<Text className='text-white text-3xl font-bold'>Alarms</Text>
			</View>

			<FlatList
				data={alarms}
				keyExtractor={(item) => item.id}
				className='flex-1 px-4'
				renderItem={({ item }) => (
					<View className='bg-gray-800 rounded-2xl p-4 mb-3 flex-row items-center justify-between'>
						<View className='flex-1'>
							<Text className='text-white text-2xl font-bold'>
								{formatTime(item.time)}
							</Text>
							<Text className='text-gray-400 text-sm mt-1'>{item.label}</Text>
						</View>
						<View className='flex-row items-center gap-3'>
							<Switch
								value={item.enabled}
								onValueChange={() => toggleAlarm(item.id)}
								trackColor={{ false: "#4B5563", true: "#10B981" }}
								thumbColor={item.enabled ? "#fff" : "#9CA3AF"}
							/>
							<TouchableOpacity
								onPress={() => deleteAlarm(item.id)}
								className='bg-red-500 px-3 py-2 rounded-lg'
							>
								<Text className='text-white font-semibold'>Delete</Text>
							</TouchableOpacity>
						</View>
					</View>
				)}
				ListEmptyComponent={
					<View className='items-center justify-center py-20'>
						<Text className='text-gray-500 text-lg'>No alarms set</Text>
						<Text className='text-gray-600 text-sm mt-2'>
							Tap + to add your first alarm
						</Text>
					</View>
				}
			/>

			<TouchableOpacity
				onPress={() => navigation.navigate("AddAlarm")}
				className='absolute bottom-8 right-8 bg-blue-500 w-16 h-16 rounded-full items-center justify-center shadow-lg'
			>
				<Text className='text-white text-3xl font-light'>+</Text>
			</TouchableOpacity>
		</View>
	);
}
