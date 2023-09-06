const socket = io();

const messages = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");
let mybtn;
let username;

const getUsername = async () => {
  const res = await fetch("/api/auth/getUsername");
  const data = await res.json();
  username = data.user.map((mappedUser) => {
    console.log(`The user logged in this site is: ${mappedUser.username}`);
    return mappedUser.username;
  });
};

const getMessages = async () => {
  const res = await fetch("/api/auth/getMessages");
  const data = await res.json();
  data.messages.forEach((item) => {
    const message = item.messageContainer.message;
    const postedBy = item.userContainer.postedby;

    let div = document.createElement("div");
    let p = document.createElement("p");
    let btn = document.createElement("button");
    item = document.createElement("li");

    if (username[0] == postedBy) {
      item.style = "display: flex;justify-content: end";
    }

    div.classList.add("hover-container");
    p.classList.add("hover-text");
    btn.classList.add("hidden-button");

    p.textContent = `${postedBy}: ${message}`;
    btn.textContent = "Verify";

    div.appendChild(p);
    div.appendChild(btn);
    item.appendChild(div);

    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);

    mybtn = document.getElementById("mybtn");
    btn.addEventListener("click", async (e) => {
      dom_data = e.target.previousElementSibling.textContent; // Getting username and message from DOM
      let array = dom_data.split(": ");
      let uname = array[0];
      let msg = array[1];

      await fetch("/api/auth/verifySign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uname, msg }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.verification == "true") {
            alert(
              `The digital signature is successfully validated of user "${data.uname}" and the signature is: \n ${data.signature}`
            );
          } else if (data.verification == "false") {
            alert("The digital signature is not validated");
          }
        })
        .catch((error) => {
          console.log(error.message);
        });
    });
  });
};

(async () => {
  await getUsername();
  window.addEventListener("load", await getMessages());
  socket.on("connect", () => {
    socket.emit("new-user-joined", username);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (input.value) {
      socket.emit("chat message", { msg: input.value, user: username[0] });
      input.value = "";
    }
  });

  socket.on("chat message", function (data) {
    let username1 = data.username;
    let msg = data.msg;

    let div = document.createElement("div");
    let p = document.createElement("p");
    let btn = document.createElement("button");
    let item = document.createElement("li");

    if (username[0] == username1) {
      item.style = "display: flex;justify-content: end";
    }

    // Giving Classes to newly created elements for styling
    div.classList.add("hover-container");
    p.classList.add("hover-text");
    btn.classList.add("hidden-button");

    p.textContent = `${username1}: ${msg}`;
    btn.textContent = "Verify";

    div.appendChild(p);
    div.appendChild(btn);
    item.appendChild(div);

    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);

    mybtn = document.getElementById("mybtn");
    btn.addEventListener("click", (e) => {
      console.log("hello");
    });
  });
})();
