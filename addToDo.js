import React, { useState } from 'react'; // Importing react and useState
import { StyleSheet, ScrollView, Text, View, TextInput, Platform, TouchableOpacity, Image, Pressable } from 'react-native'; // Import necessary components for the UI
import { Ionicons } from '@expo/vector-icons'; // Provides the icons needed for the UI
import top_corner from './assets/top_corner.png'; // importing the image for background
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation


// The function below defines the main component, where it defines the state of the task name, description, date to be done, and priority
const AddingToDoPage = () => {
  const navigation = useNavigation(); // Get the navigation object
  const [task, setTask] = useState(''); // default value of task is empty string
  const [description, setDescription] = useState(''); // default value of description is empty string
  const [selectedDate, setSelectedDate] = useState(() => {
    const initialDate = task.date ? new Date(task.date) : new Date();
    initialDate.setHours(10, 0, 0, 0); // Set time to 10:00 AM
    return initialDate;
  });  const [priority, setPriority] = useState(0); // Priority in this case is 0 (no priority) there are three total levels (1,2,3) which indicate low, medium, and high
  const [showPicker, setPicker] = useState(false);
  

  const toggleDatePicker = () => {
    setPicker(!showPicker)
  };

  const onChange = ({ type }, selectedDate) => {
    if (type == "set") {
      const dateSelected =selectedDate;
      dateSelected.setHours(10, 0, 0, 0);
      setSelectedDate(dateSelected)
      if(Platform.OS === "android") {
        toggleDatePicker();
        setSelectedDate(dateSelected);
      }
    } else {
      toggleDatePicker();
    }
  };

  const confirmDateIOS = () => {
    toggleDatePicker();
  };
  

  // The code below updates the setPriority constant to the new priority level selected
  const prioritySelect = (level) => {
    setPriority(level);
  };
  


  //WRITING TO DO LIST TASKS INTO DATABASE 
  //https://www.youtube.com/watch?v=9orKRpPMveY&t=1928s (from : 30:40-34:10)
  //https://firebase.google.com/docs/auth/web/manage-users#web-version-8
  //https://github.com/jayisback11/firebase-todo-list/tree/master/src/components
  const writeToDatabase = () => {
    try {
      if (!task.trim()) {
        alert('Task name cannot be empty!'); // Show an alert to the user
        return; // Stop the function from proceeding
      }
      if (priority === 0) {
        alert('Please select a priority!'); // Show an alert to the user
        return; // Stop the function from proceeding
      }

      const auth = getAuth();
      const db = getDatabase(); 
      //getting the current signed in user 
      const user = auth.currentUser;
      //unique ID based on the user 
      const uidd = Date.now(); 
      
      let formattedDate;
    if (selectedDate) {
        // Format the date to YYYY-MM-DD
    formattedDate = selectedDate.toISOString().split("T")[0];
    } else {
        // If no date is selected, set formattedDate to an empty string or handle it as needed
    formattedDate = '';
    }
      
      //reference the database, for each user: which has a unique user UID, the task, description, and date is saved 
      set(ref(db, `/${user.uid}/${uidd}`),  {
        // save the task as task on the database 
        task: task, 
        // save the description as description on the database 
        description: description, 
        // save the date as date on the database
        date: formattedDate, 
        //save completed 
        completed: false,
        //save priority 
        priority: priority,
      });
      //indicating success of operation
      alert('Task saved successfully!');

      //clearing fields 
      setTask(''); 
      setDescription(''); 
      setSelectedDate(''); 
      navigation.goBack();
    } 
    catch (error) {
      console.error('Error saving task: ', error);
      alert('Failed to save task. Please try again.');
    }
  };



  return (
    
    <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
      {/*The code below displays the circles in the background*/}
         
      <Image
        source={top_corner}
        style={styles.image}
      

        />
     <View style={styles.labelRow}>
      <Ionicons name="add-circle" size={30} color="rgba(247, 136, 136, 1)" /> 
      <Text style={styles.label}>Add a New Task</Text>
     </View>
     

      <Text style = {styles.labelTB}>Task Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Input the task name!" // this will be viewed in the text box
        value = {task}
        maxLength = {30}
        onChangeText={(text) => setTask(text)} // This will update the state of "task" based on what the user inputted
      />
   <Text style = {styles.descTB}>Description</Text>
      {/* This applies the same functionality as the code above but for description of the task*/}
      <TextInput
      style={[styles.inputDesc, {height: 100}]}
      placeholder="Describe the task!" // this will be viewed in the description textbox
      value={description}
      multiline = {true}
      maxLength = {100}

      onChangeText={(text) => setDescription(text)} // Corrected handler
      />
      
      {/* The code below views the date picker, source from https://www.youtube.com/watch?v=UEfFjfW7Zes*/}
      <View>
      <Text style={styles.dateLabel}>Date</Text>
  <TextInput
    style={styles.dateTB}
    placeholder="Click to select a date"
    value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""} // Format as DD/MM/YYYY
    editable={false} // Prevent editing
    onPressIn={toggleDatePicker} // Show date picker on press
  />

  {showPicker && (
    <View
      style={{
        backgroundColor: "rgba(247, 136, 136, 1)",
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
      }}
    >
      <DateTimePicker
        mode="date"
        display="spinner"
        value={selectedDate}
        onChange={onChange}
        style={styles.datePicker}
        minimumDate={new Date()}
      />
    </View>
  )}

{/* iOS-specific confirm and cancel buttons */} 
{showPicker && Platform.OS === "ios" && (
            <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 10 }}>
              <TouchableOpacity style={styles.dateButton} onPress={toggleDatePicker}>
                <Text style={styles.buText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateButton} onPress={toggleDatePicker}>
                <Text style={styles.buText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          )}
        
      </View>
      <Text style={styles.priorityLabel}>Priority</Text>

      {/* Code below displays "Set priority" text including the thermometer icons */}
      <View style={styles.priorityRow}>
        <TouchableOpacity
        // this creates the priority button (low/green) and changes the value of priority if the button was pressed on
          style={[styles.priorityButton, priority === 1 && styles.selectedPriority(1)]}
          onPress={() => prioritySelect(1)}  // once pressed, call the function
        >
          {/* set the icon green */}
          <Ionicons name="thermometer" size={20} color="green" />
        </TouchableOpacity>

        <TouchableOpacity
         // this creates the priority button (med/orange) and changes the value of priority if the button was pressed on
          style={[styles.priorityButton, priority === 2 && styles.selectedPriority(2)]}
          onPress={() => prioritySelect(2)} // once pressed, call the function
        >
          {/* set the icon orange */}
          <Ionicons name="thermometer" size={20} color="orange" /> 
        </TouchableOpacity>

        <TouchableOpacity
         // this creates the priority button (high/red) and changes the value of priority if the button was pressed on
          style={[styles.priorityButton, priority === 3 && styles.selectedPriority(3)]}
          onPress={() => prioritySelect(3)} // once pressed, call the function
        >
          {/* set the icon red */}
          <Ionicons name="thermometer" size={20} color="red" />
        </TouchableOpacity>
      </View>

      {/* when user clicks save, the writeToDatabase() is called to write to the database the content*/}
      <TouchableOpacity style={styles.saveButton} onPress={writeToDatabase}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button}>
        {/* This views the last two buttons in the page, which are the "Link to child" button and "Save" button */}
        <Text style={styles.buttonText}>Link to Child</Text> 
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.navigate('ToDoList')}>
        {/* This views the last two buttons in the page, which are the "Link to child" button and "Save" button */}
        <Text style={{color: 'grey'}}>Go back</Text> 
        </TouchableOpacity>
    </View> 
    </ScrollView>

  );
}
// The following code below defines the style (color, appearance, alignment, etc.) of each component in the UI
const styles = StyleSheet.create({
  // Here we make the container for all the components in the page, 
  container: {
    flexGrow: 1, // taking up extra space available on the phone 
    backgroundColor: 'f0f0f0', // setting background color 
    padding: 20, // adding padding across the screen edge (so components dont look expanded)
    paddingTop: 80, // add padding only in the top (make components go lower)
  },
  // the label below is strictly for the labels on top of the firts two textboxes
  label: {
    fontSize: 30, // adjusting font size
    color: 'rgb(247, 136, 136)', // setting font color to black
    position: 'relative',
    zIndex: 1,
    fontWeight: "bold",
    left: 3,
  },
  labelTB: {
    color: 'gray',
    fontSize: 17,
    marginTop: 8,
    fontWeight: "bold",
  }, 
  descTB: {
    color: 'gray',
    fontSize: 17,
    marginTop: 5,
    fontWeight: "bold",
  },
  // these are the styles for the two textboxes on the top page
  input: {
    height: 40, // setting the height of the pages (how long it it)
    borderColor: '#ccc', // setting the border color to grey
    borderWidth: 1, // setting border width/thickness
    marginBottom: 15, // creating a space between the text box and whats below it
    paddingHorizontal: 15, // creating the horizontal padding for the text to be inputted in the textbox
    borderRadius: 7, // roundness of the edges
    backgroundColor: 'white', // setting background color of the textbox
    borderColor: 'rgba(247, 136, 136, 0.61)',
    marginTop: 8,
    position: 'relative',
    zIndex: 1,
    color: 'gray',
    fontSize: 16,
  },
  inputDesc: {
    marginTop: 8,
    borderColor: '#ccc', // setting the border color to grey
    borderWidth: 1, // setting border width/thickness
    marginBottom: 15, // creating a space between the text box and whats below it
    paddingHorizontal: 14, // creating the horizontal padding for the text to be inputted in the textbox
    borderRadius: 7, // roundness of the edges
    backgroundColor: 'white', // setting background color of the textbox
    borderColor: 'rgba(247, 136, 136, 0.61)',
    position: 'relative',
    width: "100%",
    color: 'gray',
    minHeight: 90,
    fontSize: 16,
    textAlignVertical: "top", // ensuring text starts from top
    ...Platform.select({
      ios: {
        paddingTop: 10,
      },
    }),
    zIndex: 1,
  },
  // The style below is strictly for the date label
  dateLabel: {
    marginBottom: 8, // setting distance between the date and whats below it
    fontSize: 17, // setting font size
    color: 'gray', // setting font color to black
    fontWeight: "bold",
    marginTop: 5,
  },
  // this style is strictly for the priority label
  priorityLabel: {
    fontSize: 17, // setting font size
    color: 'gray', // setting font color
    fontWeight: "bold",
    marginTop: 8,
    marginRight: 56, // setting distance between the label and whats on the right of it
  },
  // this style is for the images on top of the page
  image: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 200,
    height: 200,
    resizeMode: "contain",     
  },
  // this style is for the priority icons
  priorityRow: {
    flexDirection: 'row', // makes child elements (elements created under it) line up horizontally
    alignItems: 'center', // aligns child elements to the center
    marginBottom: 12, // creates a space between it and the bottom components
    marginTop: 16,    // creates space between it and top components
    paddingVertical: 4,
   
  },

  labelRow: {
    flexDirection: 'row', // makes child elements (elements created under it) line up horizontally
    alignItems: 'center', // aligns child elements to the center
    marginTop: 70,    // creates space between it and top components
    paddingVertical: 4,
    marginBottom: 1, // creates a space between it and the bottom components
    borderRadius: 6,
    left: 90,
  },
// this style is for the priority buttons/icons
  priorityButton: {
    padding: 20, // this increases the overall padding around the button
    marginHorizontal: 30, // this creates the distance between the button from the right and left between other components
  },
  // code below sets the background color of the priority button depending on the icon pressed
  selectedPriority: (color) => ({
    backgroundColor: color === 1 ? '#CCFFCC' : color === 2 ? '#FFE5CC' : '#FFCCCC', 
    borderRadius: 7, // sets the radius of the border (the more it is the smoother the borders are) 
  }),
  // sets the style of the linkToChild button
  button: {
    backgroundColor: 'rgba(247, 136, 136, 1)', // sets the color to coral-ish pink
    padding: 15, // sets space between text and edge of button
    borderRadius: 5, // sets smoothness of borders
    alignItems: 'center', // align the text of the button to the center
    marginVertical: 5, // sets space between the button and other vertically present components 
  },
  // setting the style for the save button
  saveButton: {
    backgroundColor: 'rgba(247, 136, 136, 1)', // setting the background color to coral-ish pink
    padding: 15, // creates distance between text in button and button edges
    borderRadius: 5, // smoothens the border
    alignItems: 'center', // aligns text in button to be in center
    marginTop: 18, // creates distance between button and components above it 
  },

  cancelButton: {
    backgroundColor: "transparent", // setting background color to white
    padding: 5, // sets space between text and edge of button
    marginBottom: 10,
    marginHorizontal: 126,
    borderRadius: 5, // sets smoothness of borders
    alignItems: 'center', // align the text of the button to the center
    marginVertical: 5, // sets space between the button and other vertically present components 
    top: -3,
  },

  // style below sets the text of the buttons
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  buText: {
    color: "#fff",
    fontWeight: "bold",
    width: "100%",
    padding: 12,
    height: 40,
  },
  dateTB: {
    height: 50, // setting the height of the pages (how long it it)
    borderWidth: 1, // setting border width/thickness
    borderRadius: 5,
    marginBottom: 10, // creating a space between the text box and whats below it
    paddingHorizontal: 15, // creating the horizontal padding for the text to be inputted in the textbox
    backgroundColor: 'white', // setting background color of the textbox
    borderColor: 'rgba(247, 136, 136, 0.61)',
    color: 'gray',
    fontSize: 16,
  },
  datePicker: {
    height: 110,
    marginTop: 5,
    marginBottom: 10,
  }, 
  dateButton: {
    paddingHorizontal: 45,
    marginVertical: 5,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: 'rgba(247, 136, 136, 1)',
  },
  scrollContainer: {
    flex: 1,
    padding: -10,
  },
});
export default AddingToDoPage;