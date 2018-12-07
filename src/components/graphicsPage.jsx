import React, { Component } from "react";
import ChrNav from "./chrNav";
import DrawControls from "./drawControls";
import ZoomControl from "./graphicsPage/zoomControl";
import DrawCanvas from "./drawCanvas";

class GraphicsPage extends Component {
  render() {
    const { width, height, scale, compositionName } = this.props;
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
    
          </div>
        </div>
      </div>
    );
  }

  componentDidUpdate() {}
}

export default GraphicsPage;