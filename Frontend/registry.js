const form = document.getElementById("form");
const username_input = document.getElementById("username_input");
const email_input = document.getElementById("email_input");
const password_input = document.getElementById("password_input");
const repeat_password_input = document.getElementById("repeat_password_input");
const error_message = document.getElementById("error_message");

form.addEventListener("submit", (e) => {    //Waiting for the submit event listener
    // e.preventDefault();   Prevents submission

    let errors = [];

    if(repeat_password_input !== null){  //This means we are in the signup
        errors = getSignUpFormErrors(username_input, email_input, password_input,repeat_password_input);
    }
    else{  //If we don't have a username input then we are in the backup
        errors = getLoginFormErrors(username_input, password_input);
    }
    if(errors.length > 0){  //If there are any errors in the array
        e.preventDefault();
        error_message.innerText = errors.join(", ");
    }
})

function getSignUpFormErrors(username_input, email_input, password_input, repeat_password_input) {
    let errors = [];

    if (username_input.value.trim() === '') {   //The trim function gets rid of all white space so username input will show message
        errors.push("Username is required");
        username_input.parentElement.classList.add('incorrect');
    }
    if (email_input.value.trim() === '') {
        errors.push("Email is required");
        email_input.parentElement.classList.add('incorrect');
    }
    if (password_input.value.trim() === '') {
        errors.push("Password is required");
        password_input.parentElement.classList.add('incorrect');
    }
    if(password_input.value.length < 8){
        errors.push("Password must be at least 8 characters long");
        password_input.parentElement.classList.add('incorrect');
    }
    if(password_input.value !== repeat_password_input.value){
        errors.push("Passwords do not match.");
        password_input.parentElement.classList.add('incorrect');
        repeat_password_input.parentElement.classList.add('incorrect');
    }
    return errors;  //Errors is a string array containing all errors.
}
function getLoginFormErrors(username_input, password_input) {
    let errors = [];

    if (username_input.value.trim() === '') {   //The trim function gets rid of all white space so username input will show message
        errors.push("Username is required");
        username_input.parentElement.classList.add('incorrect');
    }
    if (password_input.value.trim() === '') {
        errors.push("Password is required");
        password_input.parentElement.classList.add('incorrect');
    }
    if(password_input.value.length < 8){
        errors.push("Password must be at least 8 characters long");
        password_input.parentElement.classList.add('incorrect');
    }
    return errors;
}
const allInputs = [username_input, email_input, password_input, repeat_password_input].filter(input => input != null);

allInputs.forEach(input => {
    input.addEventListener(`input`,() =>{
        if(input.parentElement.classList.contains('incorrect')){
            input.parentElement.classList.remove('incorrect');
            error_message.innerText = '';
        }
    })
})

fetch("http://localhost:3000/health")
  .then(res => res.json())
  .then(data => {
    console.log("Backend response:", data);
  });
