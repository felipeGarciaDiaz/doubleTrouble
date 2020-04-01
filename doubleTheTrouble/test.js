
    localStorage.setItem("storageName", "Not Clicked!");

document.getElementById("pressme").onclick = function () {
    localStorage.setItem("storageName", "Clicked!");
}

if(localStorage.getItem("storageName") === "Not Clicked!") {
    document.getElementBy("pressed").innerHTML = "Button Was Never Pressed... :(";
}else if(localStorage.getItem("storageName") === "Clicked!") {
    document.getElementBy("pressed").innerHTML = "Button Was Pressed!!! :)";

}
