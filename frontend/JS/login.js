document.getElementById("loginForm").addEventListener("submit", async function(e){
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch("/py/login", {
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

    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.href = "index.html";

  } else {
    alert("Login failed");
  }
});