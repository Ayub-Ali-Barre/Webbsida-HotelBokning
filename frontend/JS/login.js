document.getElementById("loginForm").addEventListener("submit", async function(e){
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch("http://127.0.0.1:8000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  });

  const data = await response.json();

  if(data.status === "login success"){

    // spara user i browsern
    localStorage.setItem("user", JSON.stringify(data.user));

    // gå till startsidan
    window.location.href = "index.html";

  } else {
    alert("Login failed");
  }
});