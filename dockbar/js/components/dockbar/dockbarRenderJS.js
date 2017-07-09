ReactDOM.render(React.createElement(
    "span",
    null,
    React.createElement(HeaderComponent, { exit: "true", caption: "Nucleus Dashboard", exitImageSrc: "img/exit.png" }),
    React.createElement(DockbarMenu, null),
    React.createElement(FooterComponent, null)
), document.getElementById('render'));

