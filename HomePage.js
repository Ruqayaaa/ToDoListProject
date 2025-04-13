import React, { useState, useEffect } from "react";
import {View,Text,FlatList,TouchableOpacity,StyleSheet,SafeAreaView,Image,TextInput} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons"; // Import MaterialIcons for different icons
import { useNavigation } from '@react-navigation/native';
import TabBar from './/TabBar';
import { getDatabase, ref, onValue, set, remove } from "firebase/database";
import { getAuth } from "firebase/auth";

const ToDoList = () => {
 const [todos, setTodos] = useState([]);
 const [filteredTodos, setFilteredTodos] = useState([]); // Filtered list for search
 const [searchQuery, setSearchQuery] = useState(""); // Search input state
 const [mood, setMood] = useState(null); // State to hold selected mood
 const [quote, setQuote] = useState(""); // State to hold selected mood
 const auth = getAuth();
 const navigation = useNavigation();

 //read from database 
 //https://www.youtube.com/watch?v=9orKRpPMveY&t=1928s 
 useEffect(() => {
 const user = auth.currentUser;
 if (user) {
 const db = getDatabase();
 //reference database
 const todosRef = ref(db, `/${user.uid}`);
 // https://firebase.google.com/docs/database/web/read-and-write
 //firebase offers onValue() function to read data and listen for changes 
 // takes in the todolist reference in the datase, takes a snapshot (contains all data at location) 
 const unsubscribe = onValue(todosRef, (snapshot) => {
 //to save data retrieved from snapshot 
 const data = snapshot.val();
 if (data) {
 //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
 //https://blog.expo.dev/react-native-flatlist-made-easy-20fca51e0327
 //Object.keys(): returns an array gived by the values in snapshot 
 /// .map goes through each item in array 
 const todosArray = Object.keys(data).map((key) => ({
 id: key,
 task: data[key].task,
 description: data[key].description,
 date: data[key].date,
 completed: data[key].completed || false,
 priority: data[key].priority,
 //empty or invalid tasks are not added 
 // todo.task checks that the task exists 
 // todo.task.trim() takes out the whitespace to make sure whether its empty or not 
 })).filter((todo) => todo.task && todo.task.trim() !== "");

 setTodos(todosArray);
 
 setFilteredTodos(todosArray); // Initialize filteredTodos with all todos
 } else {
 setTodos([]);
 setFilteredTodos([]);
 }
 });
 //to ensure that the system stops listening to the database 
 return () => unsubscribe();
 }
 }, []);

 const handleSearch = (query) => {
 setSearchQuery(query);
 if (query.trim() === "") {
 setFilteredTodos(todos);
 } else {
 setFilteredTodos(
 todos.filter(todo => todo.task.toLowerCase().includes(query.toLowerCase()))
 );
 }
 };
/// toggle the completed state of a todo item
 const toggleTodoCompleted = (id) => {
 // Update the local state
 const updatedTodos = todos.map((todo) =>
 todo.id === id ? { ...todo, completed: !todo.completed } : todo
 ); // Toggle the completed state
 setTodos(updatedTodos);

 const user = auth.currentUser;
 if (user) {
 // Update the completed state in Firebase
 const db = getDatabase();
 const updatedTodo = updatedTodos.find(todo => todo.id === id); // Get the updated todo
 const todoRef = ref(db, `/${user.uid}/${id}`);
 set(todoRef, updatedTodo).catch((error) => {
 console.error("Error updating task:", error);
 });
 }
 };
//DELETE 
 //https://www.youtube.com/watch?v=9orKRpPMveY&t=1928s
 const deleteTodo = (id) => {
 const user = auth.currentUser;
 const db = getDatabase();
 if (user) {
 remove(ref(db, `/${user.uid}/${id}`)).catch((error) => {
 console.error("Error deleting task:", error);
 });
 }
 };
//assigning priority to tasks
 //takes an item from an object in this case itll be priority
 //https://reactnative.dev/docs/using-a-listview 
 const renderTodo = ({ item }) => {
 let priorityColor = item.priority === 3 ? "red" : item.priority === 2 ? "orange" : "green";

 return (
 
 /*If a task item is pressed, it navigates to the edit to do page. task:item is there to pass the pressed task to the next screen */
 <TouchableOpacity onPress={() => navigation.navigate("EditingToDoPage", { task: item })}>
 <View style={styles.todoContainer}>
 <TouchableOpacity onPress={() => toggleTodoCompleted(item.id)} style={styles.checkbox}>
 {item.completed && <View style={styles.checkedCheckbox} />}
 </TouchableOpacity>
 <View style={styles.todoContent}>
 <Text style={[styles.todoText, { textDecorationLine: item.completed ? "line-through" : "none" }]}>
 {item.task}
 </Text>
 <Text style={styles.todoDate}>{item.date}</Text>
 </View>
 <Ionicons name="thermometer" size={20} color={priorityColor} style={styles.priorityIcon} />
 <TouchableOpacity onPress={() => deleteTodo(item.id)}>
 <Ionicons name="trash-outline" size={24} color="red" />
 </TouchableOpacity>
 </View>
 </TouchableOpacity>
 );
 };

 const handleMoodSelection = (selectedMood) => {
 setMood(selectedMood);
 if (selectedMood === "happy") {
 setQuote("You're doing amazing! Keep it up!");
 } else if (selectedMood === "neutral") {
 setQuote("Stay focused, great things are coming your way!");
 } else if (selectedMood === "sad") {
 setQuote("Tough times don't last, but tough people do. Keep going!");
 }
 };

 return (
 <SafeAreaView style={styles.container}>
 {/* Search Bar */}
 <View style={styles.searchContainer}>
 <TextInput
 style={styles.searchInput}
 placeholder="Search tasks..."
 value={searchQuery}
 onChangeText={handleSearch}
 />
 <Ionicons name="search" size={30} color="#4EC5C5" style={styles.searchIcon} />
 </View>

 {/* Welcome Section */}
 <View style={styles.welcomeSection}>
 <Text style={styles.welcomeText}>Welcome Back</Text>
 </View>

 {/* Mood Selection Section */}
 <View style={styles.moodContainer}>
 <Text style={styles.moodText}>How are you feeling today?</Text>
 <View style={styles.iconsContainer}>
 <TouchableOpacity onPress={() => handleMoodSelection("happy")}>
 <MaterialIcons name="mood" size={40} color="green" />
 </TouchableOpacity>
 <TouchableOpacity onPress={() => handleMoodSelection("neutral")}>
 <MaterialIcons name="sentiment-neutral" size={41} color="orange" />
 </TouchableOpacity>
 <TouchableOpacity onPress={() => handleMoodSelection("sad")}>
 <MaterialIcons name="mood-bad" size={40} color="red" />
 </TouchableOpacity>
 </View>
 {mood && <Text style={styles.quoteText}>{quote}</Text>}
 </View>

 {/* Top Image */}
 <Image source={require("./assets/top_corner.png")} style={styles.image} />

 {/* Header */}
 <View style={styles.header}>
 <Text style={styles.title}>To-Do List</Text>
 </View>

 {/* To-Do List */}
 <FlatList
 data={filteredTodos}
 renderItem={renderTodo}
 keyExtractor={(item) => item.id}
 contentContainerStyle={styles.listContainer}
 ListEmptyComponent={
 <View style={styles.emptyContainer}>
 <Text style={styles.emptyText}>No tasks yet. Add a task to get started!</Text>
 <TouchableOpacity onPress={() => navigation.navigate("AddingToDoPage")}>
 <Text style={styles.addTaskText}>Add a Task</Text>
 </TouchableOpacity>
 </View>
 }
 />

 {/* Tab Bar */}
 <TabBar />
 </SafeAreaView>
 );
};

const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: "f0f0f0",
 paddingHorizontal: 20,
 paddingBottom: 60,
 alignItems: "center", // Centers everything inside the container
 },
 image: {
 position: "absolute",
 top: 0,
 left: 0,
 width: 200,
 height: 200,
 resizeMode: "contain",
 },
 searchContainer: {
 flexDirection: "row",
 alignItems: "center",
 backgroundColor: "#fff",
 borderRadius: 8,
 paddingHorizontal: 10,
 paddingVertical: 5,
 marginBottom: 10,
 width: "40%",
 borderWidth: 1,
 borderColor: "#ccc",
 alignSelf: "flex-end",
 marginRight: 10,
 },
 searchInput: {
 flex: 1,
 fontSize: 16,
 },
 searchIcon: {
 marginLeft: 10,
 },
 welcomeSection: {
 alignItems: 'center',
 marginVertical: 10, // Optional, to give some space before the "How are you feeling" section
 marginTop: 80,
 },
 welcomeText: {
 fontWeight: 'bold',
 textAlign: 'center',
 fontSize: 30,
 color: 'rgb(247, 136, 136)',
 },
 header: {
 alignItems: "center",
 marginVertical: 10,
 },
 title: {
 fontSize: 24,
 fontWeight: "bold",
 },
 moodContainer: {
 alignItems: "center",
 marginTop: 30, // Adjust this to reduce the gap between sections
 },
 moodText: {
 fontSize: 18,
 color: "#333",
 marginBottom: 25,
 },
 iconsContainer: {
 flexDirection: "row",
 justifyContent: "space-between",
 width: "60%",
 marginBottom: 30,
 },
 quoteText: {
 fontSize: 16,
 color: "#333",
 textAlign: "center",
 fontStyle: "italic",
 marginBottom: 20,
 },
 listContainer: {
 paddingBottom: 30,
 },
 todoContainer: {
 flexDirection: "row",
 alignItems: "center",
 backgroundColor: "#FFFFFF",
 padding: 12,
 borderRadius: 10,
 borderWidth: 1,
 borderColor: "#FD6262",
 marginVertical: 5,
 shadowColor: "#000",
 shadowOffset: { width: 0, height: 2 },
 shadowOpacity: 0.1,
 shadowRadius: 2,
 justifyContent: "space-between",
 width: "97%",
 },
 todoContent: {
 flex: 1,
 marginLeft: 10,
 },
 todoText: {
 fontSize: 18,
 color: "#333",
 },
 todoDate: {
 fontSize: 12,
 color: "lightgray",
 },
 checkbox: {
 width: 24,
 height: 24,
 borderWidth: 1,
 borderColor: "gray",
 borderRadius: 4,
 backgroundColor: "white",
 marginRight: 10,
 justifyContent: "center",
 alignItems: "center",
 },
 checkedCheckbox: {
 width: 16,
 height: 16,
 backgroundColor: "#FD6262",
 },
 priorityIcon: {
 marginLeft: 10,
 },
 emptyContainer: {
 alignItems: 'center',
 marginTop: 30,
 },
 emptyText: {
 fontSize: 16,
 color: "#999",
 marginBottom: 10,
 },
 addTaskText: {
 fontSize: 16,
 color: "#4EC5C5",
 },
});

export default ToDoList;