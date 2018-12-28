import React, { Component } from "react";
import { connect } from "react-redux";
import { Container, Row, Col, Button } from "reactstrap";
import { setTextStrings } from "../../redux/actions/romSettings";


class TextFinder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTable: props.textTables[0].tbl,
      searchSettings: {
        prgOnly: true,
        noNumbers: true
      },
      possibleStrings: []
    };
  }

  render() {
    if (this.state.possibleStrings.length > 0) {
      const selectStrings = this.state.possibleStrings.map((finding, i) => {
        const isCovered = finding.isCovered ? "Exists" : "";
        const isSelected = finding.keep ? " selected" : "";

        const string = <span>
            <span class="excluded-letters">
              {finding.string.substring(0, finding.cutStart)}
            </span>
            <span class="selected-letters">
              {finding.string.substring(
                finding.cutStart,
                finding.string.length - finding.cutEnd
              )}
            </span>
            <span class="excluded-letters">
              {finding.string.substring(
                finding.string.length - finding.cutEnd
              )}
            </span>
          </span>;

        return (
          <tr key={finding.string + i} className={isSelected}>
            <td>
            <input
              type="checkbox"
              id={"finding_" + i}
              onClick={e => {
                this.selectString(e.target.checked,i);
              }}
              className="input"
            />{' '}
            {isCovered}{string}
            </td>
            <td>
            <input
              type="number"
              className="input one-digit"
              value={finding.cutStart}
              onChange={e => this.cutString(e.target.value, i, "Start")}
              />
            </td>
            <td>
            <input
              type="number"
              className="input one-digit"
              value={finding.cutEnd}
              onChange={e => this.cutString(e.target.value, i, "End")}
            />
            </td>
          </tr>
        );
      });
      return (
        <div>
          <table className="string-finder">
            <tr><td>String</td><td>left</td><td>right</td></tr>
            <tbody>{selectStrings}</tbody>
          </table>
          <Button onClick={this.saveStrings}>Save</Button>
        </div>
      );
    }

    return (
      <div>
        textfinder
        <input type="checkbox" /> Search PRG Rom only
        <input type="checkbox" /> Skip numbers
        <Button onClick={this.findPossibleStrings}>
          Find possible strings
        </Button>
      </div>
    );
  }

  cutString(value, i, part) {
    const possibleStrings = [...this.state.possibleStrings];
    value = (value < 0 || value === "") ? 0 : parseInt(value, 10);
    possibleStrings[i].keep = true;
    possibleStrings[i]["cut" + part] = value;
    console.log(possibleStrings[i].string.length - 1);
    if((possibleStrings[i].cutStart+possibleStrings[i].cutEnd) > (possibleStrings[i].string.length-1)) {
      possibleStrings[i]["cut" + part] = possibleStrings[i].string.length - 1 - possibleStrings[i]["cut" + (part === "Start" ? "End" : "Start")];
    }
    this.setState({ possibleStrings });
  }

  selectString(checked, i) {
    const possibleStrings = [...this.state.possibleStrings];
    possibleStrings[i].keep = checked;
    this.setState({ possibleStrings });
  }

  findPossibleStrings = () => {
    const table = this.state.currentTable;
    const noNumbers = true;
    console.log(this.props.textTables);
    console.log(table);
    const findings = [];
    const minLength = 3;
    const okSkip = 0;
    let foundCount = 0;
    let treshold = okSkip;
    const lastCheck = this.props.romData.byteLength - minLength;
    let step = 0;
    let string = "";
    for (let i = 0; i < lastCheck; i++) {
      const value = this.props.romData.getUint8(i);
      if (
        table.hasOwnProperty(value) &&
        !(noNumbers && (table[value] === "0" || table[value] > 0))
      ) {
        string += table[value];
        step++;
        treshold = okSkip;
      } else {
        treshold--;
        if (step >= minLength) {
          if (treshold > 0) {
            string += "?";
            continue;
          } else {
            const address = i - string.length;
            const strLen = string.length;
            const isCovered = this.isCovered(address, strLen);
            const numCnt = string.match(/[0-9]/g)
              ? string.match(/[0-9]/g).length
              : 0;
            const spaceCnt = string.match(/\s/g)
              ? string.match(/\s/g).length
              : 0;

            // Require mostly letters and at least letters
            if (
              spaceCnt < strLen - minLength &&
              (numCnt / strLen < 0.5 && strLen - numCnt > minLength)
            ) {
              foundCount++;
              console.log(numCnt, strLen, string);
              findings.push({
                address: i - string.length,
                string,
                cutStart: 0,
                cutEnd: 0,
                isCovered,
                keep: false
              });
            }
          }
        }
        string = "";
        step = 0;
      }
    }
    console.log("Found", foundCount);
    this.setState({ possibleStrings: findings });
  };

  saveStrings = () => {
    const texts = [...this.props.textStrings];
    this.state.possibleStrings.forEach(string => {
      if (string.keep) {
        texts.push({
          description: null,
          address: string.address + string.cutStart,
          length: string.string.length - string.cutStart - string.cutEnd,
          table: 0
        });
      }
    });
    this.props.setTextStrings(texts);
    


  };

  isCovered(address, len) {
    let isCovered = false;
    console.log(this.props.textStrings);
    this.props.textStrings.some(text => {
      // Stored address within current span
      if (text.address >= address && text.address <= address + len) {
        isCovered = true;
        return true;
      }
      // Current span within stored address
      if (address >= text.address && address <= text.address + text.length) {
        isCovered = true;
        return true;
      }
    });
    return isCovered;
  }
}

const mapStateToProps = state => {
  return {
    textTables: state.romSettingsReducer.textTables,
    textStrings: state.romSettingsReducer.textStrings,
    romSettings: state.nesRomReducer.romSettings,
    romData: state.nesRomReducer.romData
    
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setTextStrings: textStrings => {
      dispatch(setTextStrings(textStrings));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TextFinder);
