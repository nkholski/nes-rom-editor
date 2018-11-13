import React from "react";
import {
    Button,
    ButtonDropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle

} from "reactstrap";

const CompositionService = {
    save(name, composition) {
        const md5 = ""; // Unique per game
        let compositions = localStorage.getItem("compositions" + md5) ? JSON.parse(localStorage.getItem("compositions" + md5)) : [];
        if(typeof(compositions) === "string"){
            compositions = [];
        }
        compositions.push(
            {
                name,
                blocks: composition,
                palette: []
            }
        )

        console.log("COMP", compositions);
        compositions[name] = composition;
        localStorage.setItem("compositions" + md5, JSON.stringify(compositions));
    },
    getList(full = false) {
        const keys = Object.keys(localStorage);
        if(!full){
            return keys;
        }
        const compositions = {};
        keys.forEach((key)=> {
            compositions[key] = localStorage.getInte(key);
        });
        return compositions;
    },
    // Did this because I was curious how it would work inside an object
    dropDownJSX(props){
                const md5 = ""; // Unique per game
                let compositions = localStorage.getItem("compositions" + md5) ? JSON.parse(localStorage.getItem("compositions" + md5)) : {};
                if (typeof (compositions) === "string") {
                    compositions = {};
                }



        const dropDownItems = <DropdownItem
            onClick={() => {
            }}
          >
          </DropdownItem>;
        return <ButtonDropdown
        isOpen={props.isDown}
        toggle={() => props.toggleDropDown('loadCompositionDropDown')}
        >
        {" "}
        <DropdownToggle caret>App</DropdownToggle>
        <DropdownMenu>
        {dropDownItems}
        </DropdownMenu>
      </ButtonDropdown>
    }

}

export default CompositionService;