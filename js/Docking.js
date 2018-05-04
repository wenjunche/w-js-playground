/**
 * Created by haseebriaz on 03/03/15.
 */

window.addEventListener("DOMContentLoaded", function() {
  if (window.fin) {
    fin.desktop.main(function() {

      // var dockingManager = DockingManager.getInstance();
      // dockingManager.init({spacing: 5, range: 50, undockOffsetX: 10, undockOffsetY: 10});
      var counter = 0;
      //dockingManager.register(fin.desktop.Window.getCurrent(), false);

      //fin.desktop.Window.getCurrent().addEventListener("focused", function (event) {
      //    console.log("The window focused");
      //    bringChildFront();
      //});

      //fin.desktop.Window.getCurrent().addEventListener("blurred", function (event) {
      //    console.log("The window blurred");
      //});

        fin.desktop.InterApplicationBus.subscribe('*', 'preload_script',  m => console.log(m));

      fin.desktop.InterApplicationBus.addSubscribeListener(function(
        uuid,
        topic
      ) {
        console.log("The application " + uuid + " has subscribed to " + topic);
      });

      fin.desktop.InterApplicationBus.addUnsubscribeListener(function(
        uuid,
        topic
      ) {
        console.log(
          "The application " + uuid + " has unsubscribed to " + topic
        );
      });

      fin.desktop.System.addEventListener(
        "application-core-terminated",
        function() {
          console.log("application core terminated");
        }
      );

      fin.desktop.System.addEventListener("application-closed", function(v) {
        console.log(v);
      });

      fin.desktop.InterApplicationBus.subscribe("*", "FlexTopic", function(
        data,
        uuid,
        name
      ) {
        try {
          console.log("got something", data, "from", uuid, "name", name);
        } catch (err) {
          console.error(err);
          console.error(err.stack);
        }
      });

      function createChildWindow1() {
        var dw = new fin.desktop.Window(
          {
            name: "c9376a5c-d415-4466-9514-78e8f8816dab",
            autoShow: true,
            url: "https://collab.reutest.com/eikonmessenger",
            showTaskbarIcon: false
          },
          function(d) {
            console.log(d);
          },
          function(e) {
            console.log(e);
          }
        );
      }

      function createChildWindow() {
        //            var cw = fin.desktop.Window.wrap(fin.desktop.Application.getCurrent().uuid, cname);
        //            cw.addEventListener("shown", function(event) {
        //                console.log('calling focus on', cw.name);
        //                cw.focus();
        //            });

        var dws = [];
        console.time("creating window");
        for (let cc = 0; cc < 3; cc++) {
          let cname = "child0" + cc;
          let dw = new fin.desktop.Window(
            {
              name: cname,
              urlstx: "https://ems-us1.redi.com/chartiq/stx-redi.html",
              url3:
                "http://openfin.github.io/example-fin-hypergrid-behavior-json/",
              urlker:
                "http://win-rmo669h5703.kerberos.openfin.co:8081/hello_delegate.jsp",
              url: "http://localhost:8081/childWindow.html",
                icon: "http://localhost:8081/openfin.ico",
              urleik: "https://amers1.views.cp.reutest.com/web/eikonmessenger",
              url2: "http://test.openf.in/angular/#/default",
              icon1: "https://trade.proquote.com/icon",
              icon2: "https://uat-trade.proquote.com/iress-icon",
              taskbarIconRedi: "http://localhost:8081/Redi.ico",
              taskbarIconxx:
                "file://C:/Users/richard/Downloads/tullet-docking-demo/static/Redi.ico",
              taskbarIconGroupxx: "bigw",
              defaultWidth: 500,
              defaultHeight: 500,
              minWidth: 734,
              maxWidthx: 300,
              minHeightx: 300,
              maxHeightx: 300,
              defaultTop: 100 + (cc * 10),
              defaultLeft: 100 + (cc * 10),
              frame: false,
              resize: true,
              autoShow: true,
              saveWindowStatex: false,
              showTaskbarIcon: true,
              opacity: 1,
              transparent: false,
              statexx: "minimized",
              minimizable: true,
              maximizable: true,
              force: true,
              alwaysOnTop: false,
              contextMenu: true,
              waitForPageLoad: true,
              delay_connectionxx: true,
              resizeRegionxx: {
                size: 10,
                bottomRightCorner: 10,
                sides: {left: false}
              },
              acceleratorxx: {
                zoom: true,
                devtools: true,
                reload: true
              },
              smallWindow: true,
              shadow: false,
              backgroundColorXX: "#000000",
              frameConnect: "all",
              cornerRoundingxx: { width: 33, height: 33 },
              backgroundThrottlingxx: false,
              preloadxx: "http://localhost:8081/js/preload.js",
              experimental: {
                node: false
              },
              customData: {
                name: "child window"
              },
              permissions: {
                System: { Clipboard: { availableFormats: false } }
              },
              customRequestHeaders: [
                {
                  urlPatterns: ["http://localhost:8081/*"],
                  headers: [
                    { "ubs-neo-platform": "launcher-tapedeck" },
                    { "ubs-neo-native-version": "1.14.1664.29120" }
                  ]
                }
              ],
              contentNavigation: {
                whitelist: [
                  "https://example.com",
                  "http://www.awesomium.com/",
                  "http://localhost:8081/*"
                ]
              }
              //accelerator: {
              //        zoom: true,
              //        devtools: true
              //}
            },
            function(v) {
              //                dw.updateOptions({"alwaysOnTop":true,"contextMenu":true,"cornerRounding":{"height":130,"width":130},"frame":false,"hideOnClose":false,"maximizable":false,"minimizable":false,"resizable":false});
              //                dw.updateOptions({"alwaysOnTop":true,"contextMenu":true,"cornerRounding":{"height":130,"width":130},"frame":false});
              //   dockingManager.register(dw);
//                dw.addEventListener('group-changed', onGroupChanged)
              console.timeEnd("creating window");
              console.log("child window created", v);
            },
            function(v) {
              console.error("child window failed", v);
            }
          );
          dws.push(dw);

          // dw.addEventListener("close-requested", function closeReqListener(v) {
          //   console.log(v);
          //   dw.removeEventListener("close-requested", closeReqListener);
          //   dw.close(true);
          // });
          // dw.addEventListener("closed", function closedListener1(v) {
          //   console.log("closed 1", v);
          //   setTimeout(function() {
          //     //                    dw.removeEventListener("closed", closedListener1);
          //   }, 0);
          // });
        }
        setTimeout(function() {
//            dws.forEach(dw => dockingManager.register(dw));
        }, 2000);

        //            dw.addEventListener("bounds-changed", function (event) {
        //               console.log(event);
        //            });
      }

    function onGroupChanged(groupEvent) {
        if (groupEvent.memberOf === GroupEventMemberOf.NOTHING) {
            console.log('group-changed event: ' + groupEvent.name + ' left group');
            return;
        }
        if (groupEvent.reason === GroupEventReason.JOIN) {
            if (groupEvent.sourceWindowName === groupEvent.name ||
                groupEvent.targetGroup.length === 2 &&
                groupEvent.targetWindowName === groupEvent.name) {
                console.log('group-changed event: ' + groupEvent.name + ' joined group');
            }
        }
    }

            var appCounter = 0;
      function createApp() {
        var app = new fin.desktop.Application(
          {
            name: "FX Derivatives",
            uuid: "BGC Trader", // + appCounter++,
            urlciq: "https://ems-us1.redi.com/chartiq/stx-redi.html",
            urlxx: "https://demoportal.bgctrader.com/",
            url: "http://localhost:8081/index.html",
            urliq: "http://openfin.chartiq.com/0.5/index.html",
            urlHello: "http://demoappdirectory.openf.in/desktop/config/apps/OpenFin/HelloOpenFin/index.html",
            url2: "http://localhost:8080/childWindow.html/#/default",
            url3: "http://test.openf.in/angular/index.html",
            url1: "http://test.openf.in/angular/#/default",
            url6: "http://openfin.github.io/fin-hypergrid/",
            icon: "http://localhost:8081/openfin.ico",
            taskbarIconGroup: "bigw",
            autoShow: true,
            frame: false,
            minimizable: false,
            maximizable: false,
            resizable: true,
            maxWidthx: 300,
            minWidthx: 300,
            waitForPageLoad: true,
            frameConnect: "main-window",
            delay_connectionXX: true,
            nonPersistent: true,
            clearChildSubscriptionsOnReload: false,
            webSecurity: false,
            backgroundColor: "#000000",
            experimental: {
                  node: false
            },
            permissions: {
              System: {
                Clipboard: { availableFormats: false },
                getConfig: true
              }
            },

            customRequestHeaders: [
              {
                urlList: ["http://localhost:8081/*"],
                headers: [
                  { "ubs-neo-platform": "launcher-tapedeck" },
                  { "ubs-neo-native-version": "1.14.1664.29120" }
                ]
              },
              {
                urlList: ["https://openfin.co", "https://*.openfin.co"],
                headers: [
                  { "app-name": "OpenFin Runtime" },
                  { "app-version": "8.0" }
                ]
              },
              {
                urlList: ["http://*.foxnews.com/*"],
                headers: [{ "app-platform": "Fair and Balanced" }]
              }
            ],

            customData: {
              name: "OpenFin",
              address: "25 Broadway"
            }
          },
          function(d) {
            app.addEventListener("started", function(v) {
              console.log(v);
            });
            app.run(function(d) {
              // app.getWindow().minimize(app.getWindow().show());
              app.setTrayIcon(
                "https://developer.openf.in/download/openfin111.png",
                function() {
                  console.log("tray icon clicked");
                },
                function() {
                  console.log("tray icon loaded");
                },
                function(e) {
                  console.log(e);
                  console.log("setTrayIcon again");

                  app.setTrayIcon(
                    "https://developer.openf.in/download/openfin.png",
                    function() {
                      console.log("tray icon clicked");
                    }
                  );
                }
              );
            });
          }
        );
      }

      function createOWA() {
        var app = new fin.desktop.Application(
          {
            name: "OWA",
            uuid: "OWA",
            url: "https://outlook.live.com",
            autoShow: true,
            frame: true,
            resizable: true,
            defaultWidth: 500,
            defaultWidth: 500
          },
          function() {
            app.run();
          }
        );
      }

      function getStates() {
        fin.desktop.Application.getCurrent().getChildWindows(function(windows) {
          async.map(
            windows,
            function(window, done) {
              window.getState(function(state) {
                done(null, "name: " + window.name + ", state: " + state + "\n");
              });
            },
            function(err, results) {
              document.getElementById("states").value = "";
              results.forEach(function(result) {
                document.getElementById("states").value += result;
              });
            }
          );
        });
      }

      function getBounds() {
        fin.desktop.Application.getCurrent().getChildWindows(function(windows) {
          async.map(
            windows,
            function(window, done) {
              window.getBounds(function(bounds) {
                done(
                  null,
                  "name: " +
                    window.name +
                    ", top: " +
                    bounds.top +
                    ", left: " +
                    bounds.left +
                    "\n"
                );
              });
            },
            function(err, results) {
              document.getElementById("bounds").value = "";
              results.forEach(function(result) {
                document.getElementById("bounds").value += result;
              });
            }
          );
        });
      }

      function bringChildFront() {
        console.log("bring child0 to front");
        var w = fin.desktop.Window.wrap("OpenFinHelloWorld", "child00");
        //w.show();
        //w.bringToFront();
        //w.focus();

        if (document.activeElement === document.getElementById("selectList")) {
          console.log("select tag is clicked");
        } else {
          console.log("bring to front");
          fin.desktop.Window.getCurrent().bringToFront(function() {});
        }
      }

      function updateDimentions() {
        document.getElementById("dimentions").innerHTML =
          "x: " +
          window.screenLeft +
          ", y: " +
          window.screenTop +
          ", width: " +
          window.outerWidth +
          ", height: " +
          window.outerHeight;
      }

      function showOpenFinSite() {
        fin.desktop.System.openUrlWithBrowser("https://openfin.co");
      }

      document.getElementById("createWindows").onclick = createChildWindow;
      document.getElementById("createApp").onclick = createApp;
      //document.getElementById("OWA").onclick = createOWA;
      document.getElementById("getStates").onclick = getStates;
      document.getElementById("bringChild").onclick = bringChildFront;

      //document.getElementById("textInput").onfocus = bringChildFront;

      //setInterval(updateDimentions, 1000);

      //fin.desktop.InterApplicationBus.publish("JsAppReadyForDotNet", {text: "I am here"});

      //createApp();

      var tempSector = { name: "testObj" };
      fin.desktop.InterApplicationBus.publish(
        "scout-sector-selected",
        tempSector
      );

      console.log("DOMContentLoaded");

      var area1 = document.getElementById("bounds");
      area1.value = fin.desktop.getVersion();
        var area2 = document.getElementById("states");
        fin.desktop.Window.getCurrent().getNativeId(d => area2.value = d);
    });
  }

  document.getElementById("printMe").onclick = printMe;
  function printMe() {
    window.print();
    console.log("after calling print");
  }

  function showNotificationCenter() {
    fin.desktop.System.showChromeNotificationCenter();
  }
  document.getElementById(
    "NotificationCenter"
  ).onclick = showNotificationCenter;

  function openPDF() {
    var pdfData =
      "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwog" +
      "IC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAv" +
      "TWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0K" +
      "Pj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAg" +
      "L1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+" +
      "PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9u" +
      "dAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2Jq" +
      "Cgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJU" +
      "CjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVu" +
      "ZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4g" +
      "CjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAw" +
      "MDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9v" +
      "dCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G";
    window.open("data:application/pdf;base64," + pdfData);
  }
  document.getElementById("base64Pdf").onclick = openPDF;

  document
    .getElementById("printMe")
    .addEventListener("dragstart", function(event) {
      //event.dataTransfer.setData("text/plain", "standard text");
      //event.dataTransfer.setData("text/html", "<html><body>This shit works</body></html>");
      event.dataTransfer.setData(
        "application/json",
        "{'data': 'standard json'}"
      );
    });

  document.addEventListener("dragover", function(event) {
    event.preventDefault();
  });
  document.addEventListener("dragenter", function(event) {
    event.preventDefault();
  });
  document.addEventListener(
    "drop",
    function(e) {
      console.log("Do I get drop effects");
      console.log(e);
      console.log("and the Data is:");
      console.log(e.dataTransfer.types);
      e.dataTransfer.types.forEach(function(type) {
        console.log(type);
        console.log(e.dataTransfer.getData(type));
      });
      e.preventDefault();
      console.log("prevent default on drop");
    },
    false
  );

  function max() {
    fin.desktop.Window.getCurrent().maximize();
  }
  document.getElementById("Max").onclick = max;
  function restore() {
    fin.desktop.Window.getCurrent().restore();
  }
  document.getElementById("Restore").onclick = restore;

  var lastNotification,
    r = true;
  function showNotification() {
    lastNotification = new fin.desktop.Notification({
      url: "notification.html",
      message: "some initial message",
      timeout: 100000,
      ignoreMouseOver2: true,
      onClick: function() {
        console.log("clicked");
        fin.desktop.Window.getCurrent()[r ? "minimize" : "restore"]();
        r = !r;
      },
      onClose: function() {
        console.log("closed");
      },
      onDismiss: function() {
        console.log("dismissed");
      },
      onError: function(reason) {},
      onMessage: function(message) {
        console.log("Received from notification:", message);
      },
      onShow: function() {
        console.log("onShow");
      }
    });
  }
  function closeNotification() {
    if (lastNotification) {
      lastNotification.close();
      lastNotification = undefined;
    }
  }
  document.getElementById("showNotification").onclick = showNotification;
  document.getElementById("closeNotification").onclick = closeNotification;

  function showDevTools() {
    var app = new fin.desktop.Application({
      name: "devtools",
      uuid: "devtools",
      url: "http://localhost:9090",
      autoShow: true,
      frame: true,
      resizable: true,
      defaultWidth: 500,
      defaultWidth: 500
    });
    app.run();
  }
  document.getElementById("Devtools").onclick = showDevTools;

  var showContextMenuToggle = true;
  function showCustomContextMenu(evt) {
    console.log("custom context menu", evt);
    evt.preventDefault();
    var nav = document.getElementById("context-menu-nav");
    nav.style.display = showContextMenuToggle ? "none" : "block";
    nav.style.left = evt.pageX + "px";
    nav.style.top = evt.pageY + "px";
    showContextMenuToggle = !showContextMenuToggle;
  }

  document
    .getElementById("customContextMenu")
    .addEventListener("contextmenu", showCustomContextMenu);

  function speak() {
    var speech = new SpeechSynthesisUtterance(
      "Build Once. Deploy Instantly. Run Natively"
    );
    speechSynthesis.speak(speech);
  }
  document.getElementById("Speak").onclick = speak;
});

const winCount = 50;

function closeWindows() {
    const uuid = fin.desktop.Application.getCurrent().uuid;
    let promises = [];
    for (let i = 0; i < winCount; i++) {
        const p = new Promise(resolve => {
            const w = fin.desktop.Window.wrap(uuid, `w${i}`);
            w.close(true, () => {
                console.log(`closed ${i}`);
                resolve()
            });
        });
        promises.push(p);
    }
    return promises;
}

function newWindows() {
    let created = 0;
    let promises = [];
    for (let i = 0; i < winCount; i++) {
        const p = new Promise(resolve => {
            const w = new fin.desktop.Window({
                name: `w${i}`, url: 'empty.html', autoShow: false,
                saveWindowState: false,
                defaultHeight: 300,
                defaultWidth: 300,
                frame: false,
                defaultLeft: 100 + i * 20,
                defaultTop: 100 + i * 20
            }, () => {
                console.log(`created ${i}`);
                resolve();
            });
        });
        promises.push(p);
    }
    return promises;
}

async function testLoop() {
    for (let i = 0; i < 5; i++) {
        await Promise.all(newWindows());
        await Promise.all(closeWindows());
        console.log(`loop ${i}`);
    }
}