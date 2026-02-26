document.getElementById("registerForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;
  const fullname = document.getElementById("fullname").value;

  fetch("http://127.0.0.1:8000/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: email,
      password: password,
      username: username,
      fullname: fullname,
    })
  })
  .then(res => res.json())
  .then(() => {
    window.location.href = "login.html";
  })
  .catch(err => console.error(err));
});
