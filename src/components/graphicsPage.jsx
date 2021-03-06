import React, { Component } from "react";
import ChrNav from "./graphicsPage/chrNav";
import DrawControls from "./graphicsPage/drawControls";
import ZoomControl from "./graphicsPage/zoomControl";
import DrawCanvas from "./graphicsPage/drawCanvas";

class GraphicsPage extends Component {
  render() {
    return (
      <div id="graphics-page" className="row">
        <div className="chrView col col-md-auto">
          <ChrNav />
        </div>
        <div className="drawView col col-xl-">
          <div class="drawing">
            <ZoomControl />
            <DrawCanvas />
          </div>
          <div>
            <DrawControls/>
          </div>
        </div>
      </div>
    );
  }

  componentDidUpdate() {}
}

export default GraphicsPage;
