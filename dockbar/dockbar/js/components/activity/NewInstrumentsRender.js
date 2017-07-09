var footerMarginStyle = { marginTop: "10px" };
React.render(<div>
                <HeaderComponent caption="New Instruments"/>
                <NewInstrumentsComponent componentId="newInstrumentsComponent" />
                <div style={footerMarginStyle }></div>                                     
            </div>
        , document.getElementById('render')
);