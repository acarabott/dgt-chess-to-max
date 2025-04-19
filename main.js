import { platform } from "process";
import { app, BrowserWindow } from "electron";
import url, { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1600,
        height: 800,
    });

    mainWindow.webContents.session.on(
        "select-serial-port",
        (event, portList, _webContents, callback) => {
            // Add listeners to handle ports being added or removed before the callback for `select-serial-port`
            // is called.
            mainWindow.webContents.session.on("serial-port-added", (_event, port) => {
                portList.push(port);
            });

            mainWindow.webContents.session.on("serial-port-removed", (_event, port) => {
                portList.splice(portList.indexOf(port), 1);
            });

            event.preventDefault();
            if (portList && portList.length > 0) {
                callback(portList[0].portId);
            } else {
                callback(""); // Could not find any matching devices
            }
        },
    );

    mainWindow.webContents.session.setPermissionCheckHandler(
        (webContents, permission, requestingOrigin, details) => {
            if (permission === "serial" && details.securityOrigin === "file:///") {
                return true;
            }

            return false;
        },
    );

    mainWindow.webContents.session.setDevicePermissionHandler((details) => {
        if (details.deviceType === "serial" && details.origin === "file://") {
            return true;
        }

        return false;
    });

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "build/index.html"),
            protocol: "file:",
            slashes: true,
        }),
    );
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", function () {
    if (platform !== "darwin") {
        app.quit();
    }
});
