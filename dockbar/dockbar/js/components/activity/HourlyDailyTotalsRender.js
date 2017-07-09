var footerMarginStyle = { marginTop: "10px" };
React.render(<div>
                <HeaderComponent caption="Activity Total"/>
                <HourlyDailyTotalsComponent componentId="hourlyDailyComponent" />
                <div style={footerMarginStyle }></div>                                     
            </div>
        , document.getElementById('render')
);