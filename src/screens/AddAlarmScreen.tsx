import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	TextInput,
	Platform,
	ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Alarm, SavedBarcode } from "../types";
import { storageService } from "../services/storageService";
import { notificationService } from "../services/notificationService";

export default function AddAlarmScreen({ navigation }: any) {
	const [time, setTime] = useState(new Date());
	const [label, setLabel] = useState("");
	const [selectedBarcode, setSelectedBarcode] = useState<string>("");
	const [savedBarcodes, setSavedBarcodes] = useState<SavedBarcode[]>([]);
	const [showTimePicker, setShowTimePicker] = useState(false);

	useEffect(() => {
		loadBarcodes();
	}, []);

	const loadBarcodes = async () => {
		const barcodes = await storageService.getBarcodes();
		setSavedBarcodes(barcodes);
	};

	const handleSaveAlarm = async () => {
		if (!selectedBarcode) {
			alert("Please select a barcode to disable this alarm");
			return;
		}

		// Schedule the notification first to get the ID
		const tempAlarm: Alarm = {
			id: Date.now().toString(),
			time,
			label: label || "Alarm",
			enabled: true,
			barcodeId: selectedBarcode,
		};

		const notificationId = await notificationService.scheduleAlarm(tempAlarm);

		// Save alarm with notification ID
		const newAlarm: Alarm = {
			...tempAlarm,
			notificationId,
		};

		const alarms = await storageService.getAlarms();
		const updatedAlarms = [...alarms, newAlarm];
		await storageService.saveAlarms(updatedAlarms);

		navigation.goBack();
	};

	const onTimeChange = (event: any, selectedDate?: Date) => {
		setShowTimePicker(Platform.OS === "ios");
		if (selectedDate) {
			setTime(selectedDate);
		}
	};

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<ScrollView className='flex-1 bg-gray-900'>
			<View className='p-6 pt-12'>
				<Text className='text-white text-3xl font-bold mb-6'>New Alarm</Text>

				{/* Time Picker */}
				<View className='bg-gray-800 rounded-2xl p-6 mb-4'>
					<Text className='text-gray-400 text-sm mb-2'>Time</Text>
					<TouchableOpacity
						onPress={() => setShowTimePicker(true)}
						className='bg-gray-700 p-4 rounded-xl'
					>
						<Text className='text-white text-2xl font-bold text-center'>
							{formatTime(time)}
						</Text>
					</TouchableOpacity>

					{showTimePicker && (
						<DateTimePicker
							value={time}
							mode='time'
							is24Hour={false}
							display='spinner'
							onChange={onTimeChange}
						/>
					)}
				</View>

				{/* Label Input */}
				<View className='bg-gray-800 rounded-2xl p-6 mb-4'>
					<Text className='text-gray-400 text-sm mb-2'>Label</Text>
					<TextInput
						value={label}
						onChangeText={setLabel}
						placeholder='Wake up'
						placeholderTextColor='#6B7280'
						className='bg-gray-700 p-4 rounded-xl text-white text-lg'
					/>
				</View>

				{/* Barcode Selection */}
				<View className='bg-gray-800 rounded-2xl p-6 mb-4'>
					<Text className='text-gray-400 text-sm mb-3'>
						Scan this barcode to stop alarm
					</Text>

					{savedBarcodes.length === 0 ? (
						<TouchableOpacity
							onPress={() =>
								navigation.navigate("ScanBarcode", { returnTo: "AddAlarm" })
							}
							className='bg-blue-500 p-4 rounded-xl'
						>
							<Text className='text-white text-center font-semibold'>
								Scan Your First Barcode
							</Text>
						</TouchableOpacity>
					) : (
						<>
							{savedBarcodes.map((barcode) => (
								<TouchableOpacity
									key={barcode.id}
									onPress={() => setSelectedBarcode(barcode.id)}
									className={`p-4 rounded-xl mb-2 ${
										selectedBarcode === barcode.id
											? "bg-blue-500"
											: "bg-gray-700"
									}`}
								>
									<Text className='text-white font-semibold'>
										{barcode.label}
									</Text>
									<Text className='text-gray-400 text-xs mt-1'>
										{barcode.type} • {barcode.data.substring(0, 15)}...
									</Text>
								</TouchableOpacity>
							))}

							<TouchableOpacity
								onPress={() =>
									navigation.navigate("ScanBarcode", { returnTo: "AddAlarm" })
								}
								className='bg-gray-700 p-4 rounded-xl mt-2 border border-gray-600 border-dashed'
							>
								<Text className='text-gray-400 text-center font-semibold'>
									+ Scan New Barcode
								</Text>
							</TouchableOpacity>
						</>
					)}
				</View>

				{/* Save Button */}
				<TouchableOpacity
					onPress={handleSaveAlarm}
					className='bg-green-500 p-5 rounded-2xl mt-4'
				>
					<Text className='text-white text-center text-lg font-bold'>
						Save Alarm
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={() => navigation.goBack()}
					className='bg-gray-800 p-5 rounded-2xl mt-3'
				>
					<Text className='text-gray-400 text-center text-lg font-semibold'>
						Cancel
					</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
}
