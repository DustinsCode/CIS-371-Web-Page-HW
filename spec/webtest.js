
describe("Web Page Homework", () => {
  const MY_HTML_FILE = "mypage.html";
  var mTable;
  var page, pageStr;
  var cssURL, MyCSSRules;
  
  const findSelectorWithPropAndValue = (prop, value) => {
    // console.debug(`Looking for selector with property ${prop}`)
    if (!MyCSSRules) return [];
    
    var result = [];
    for (k = 0; k < MyCSSRules.length; k++) {
      // prop is a CSSStyleRule
      const rule = MyCSSRules[k];
      console.debug(`Selector ${rule.cssText}`);
      const val = rule.style[prop];
      if (val == "")
      continue;
      // console.debug(`Found ${prop} => ${val}`);
      // if the requested value is undefined or 
      // it is defined and matches
      if (!value || val == value) {
        result.push(rule);
      }
      // for (s in rule.style) {
      //   const key = rule.style[s];
      //   const val = rule.style[key];
      //   if (key == prop && val == compareRef) {
      //     console.debug(`    ${key} => ${val}`);
      //     result.push(rule);
      //     break;
      //   }
      // }
    }
    return result;
  }
  
  const findClassInCSS = klazname => {
    for (k = 0; k < MyCSSRules.length; k++) {
      const rule = MyCSSRules[k];
      if (rule.selectorText == '.' + klazname)
      return true;
    }
    console.debug(`Class ${klazname} is not defined`);
    return false;
  }
  
  const matchElementsWithStyles = (elems, selectors) => {
    var whichOnes = [];
    for (k = 0; k < selectors.length; k++) {
      const toks = selectors[k].selectorText.split(",");
      for (m = 0; m < toks.length; m++) {
        const elems = page.querySelectorAll(toks[m]);
        if (elems)
          whichOnes.push(...elems);
      }
    }
    for (k = 0; k < elems.length; k++) {
      const el = elems[k];
      for (m = 0; m < whichOnes.length; m++) {
        const cmp = whichOnes[m];
        if (el.nodeName == cmp.nodeName && el.className == cmp.className) 
          return true;
      }
    }
      /*
    for (k = 0; k < elems.length; k++) {
      const el = elems[k];
      // Check if element id is one of the selectors
      if (el && el.id) {
        console.debug(`Image info ID=${el.id}`);
        for (m = 0; m < selectors.length; m++) {
          const sel = selectors[k];
          if ('#' + el.id == sel.selectorText) {
            return true;
          }
        }
      }
      // Check if element class is one of the selectors
      if (el && el.className) {
        console.debug(`Image class is=${el.className}`);
        const klaz = el.className.split(" ");
        for (c = 0; c < klaz.length; c++) {
          const klazName = klaz[c];
          for (m = 0; m < selectors.length; m++) {
            const sel = selectors[m];
            if ('.' + klazName == sel.selectorText) {
              return true;
            }
          }
        }
      }
    }
    */
    return false;
  }
  
  
  beforeAll( (done) => {
    jasmine.getFixtures().fixturesPath = "./";
    const out = readFixtures(MY_HTML_FILE);
    pageStr = readFixtures(MY_HTML_FILE);
    page = document.createElement("html");
    page.innerHTML = pageStr;
    const exStyle = page.querySelector("html > head > link[rel=stylesheet][href]")
    if (!exStyle) done();
    if (exStyle) {
      // extract the style file name
      cssURL = exStyle.getAttribute("href");
      // console.debug(`Stylesheet at ${cssURL}`)
      
      const fetchOption = {
        mode: "cors", // Cross-Origin Resource Sharing
        headers: {
          "Content-Type" : "text/css"
        }
      }
      
      // Fetch the style file
      fetch(cssURL, fetchOption)
      .then (response => {
        return response.text(); // convert response body to text
      })
      .then (text => {
        // console.log(`CSS is ${text}`);
        // Parse the style definitions
        const doc = document.implementation.createHTMLDocument("");
        const styleElm = document.createElement("style");
        styleElm.textContent = text;
        // style must be added to a document to initiate parsing
        doc.body.appendChild(styleElm);
        MyCSSRules = styleElm.sheet.cssRules;
        done();
      })
      .catch(error => {
        alert(`Unable to fetch style file ${cssURL}: ${error}`);
      })
    }
  })
  
  beforeEach( () => {
    loadFixtures(MY_HTML_FILE);
    const el1 = $("table[id=mainTable] > tr");
    const el2 = $("table[id=mainTable] > tbody > tr");
    if (el1.length > 0) {
      mTable = el1[0].parentElement;
    } else if (el2.length > 0) {
      mTable = el2[0].parentElement;
    }
  })
  
  describe('XHTML Compliant/Structure', () => {
    it ('begins with !DOCTYPE', () => {
      const str = pageStr.trim().toLowerCase();
      expect (str.startsWith("<!doctype html public")).toBeTruthy();
    })
    
    it("has <title>", () => {
      const el = page.querySelector("html > head > title");
      if (!el)
      fail();
      else {
        expect(el).toExist();
        expect(el.childNodes.length).toBeGreaterThan(0);
        expect(el.childNodes[0].nodeName).toEqual("#text");
      }
    })
    
    it("has <body>", () => {
      const el = page.querySelector("html > body");
      expect(el).toExist();
    })
    
    it("has <head>", () => {
      const el = page.querySelector("html > head");
      expect(el).toExist();
    })
    
    it("uses an external style", () => {
      const exStyle = page.querySelector("html > head > link[rel=stylesheet][href]")
      expect(exStyle).not.toBeNull();
      if (!exStyle)
      fail();
    })
  })
  
  it('shall use no inline styles', () => {
    const elems = page.querySelectorAll("[style]");
    expect(elems).not.toExist();
  })
  
  it("has <heading>", () => {
    // check heading h1, h2, ..., h6
    for (var level = 1; level <= 6; level++) {
      const el = page.querySelector("h" + level);
      expect(el).not.toBeNull();
      if (el) return;
    }
    fail();
  })
  
  it("has picture with float right", () => {
    const selectors = findSelectorWithPropAndValue("float", "right");
    expect(selectors).not.toBeNull();
    expect(selectors.length).toBeGreaterThan(0);
    for (k = 0; k < selectors.length; k++) {
      const sel = selectors[k];
      console.debug(`Selector with float:right ${sel.selectorText}`);
      if (sel.selectorText == "img") {
        return;
      }
    }
    const images = page.querySelectorAll("body > img:first-of-type");
    expect(images).not.toBeNull();
    expect(images.length).toBeGreaterThan(0);
    expect(matchElementsWithStyles (images, selectors)).toBeTruthy();
  })
  
  it("picture of inspirational person has margins", () => {
    const pic = page.querySelector("body > img:first-of-type");
    expect(pic).toExist();
    const selectors = findSelectorWithPropAndValue("margin-bottom");
    const isFound = matchElementsWithStyles([pic], selectors);
    expect(isFound).toBeTruthy();
  })
  
  it("has table with id mainTable", () => {
    const el = $("table[id=mainTable]");
    expect(el).toExist();
  })
  
  it("mainTable has no border", () => {
    const el = $("table[id=mainTable]");
    expect(el).toExist();
    const el1 = $("table[id=mainTable][border]");
    expect(el1.length).toEqual(0);
  })
  
  it("has a mainTable with three rows", () => {
    if (!mTable) {
      fail();
      return;
    }
    const el = mTable.querySelectorAll("tr");
    expect(el.length >= 3).toBeTruthy();
  })
  
  it("has mainTable with two columns", () => {
    if (!mTable) {
      fail();
      return;
    }
    // locate the parent element and then find the immediate children td of tr
    const cols = mTable.querySelectorAll("tr > td");
    expect(cols).not.toBeNull();
    expect(cols.length).toBeGreaterThan(5);
  })
  
  it("has table cell contents inside a div", () => {
    if (!mTable) {
      fail();
      return;
    }
    const divs = mTable.querySelectorAll("tr > td div");
    expect(divs).not.toBeNull();
    expect(divs.length).toBeGreaterThan(5);
  })
  
  it("divs in main table have a class", () => {
    if (!mTable) {
      fail();
      return;
    }
    const divs = mTable.querySelectorAll("tr > td div");
    const divsWithClass = mTable.querySelectorAll("tr > td div[class]");
    const divsWithEmptyClass = mTable.querySelectorAll("tr > td div[class='']");
    expect(divs.length).toEqual(divsWithClass.length);
    expect(divsWithEmptyClass.length).toEqual(0);
  })
  
  it("classes in mainTable divs are defined", () => {
    if (!mTable) {
      fail();
      return;
    }
    const divsWithClass = mTable.querySelectorAll("tr > td div[class]");
    for (k = 0; k < divsWithClass.length; k++) {
      const el = divsWithClass[k];
      const klazName = el.className.split(" ");
      expect(findClassInCSS(klazName)).toBeTruthy();
    }
  })
  
  it("topleft cell in main table contains unordered list", () => {
    if (!mTable) {
      fail();
      return;
    }
    const unorderedInfirstCell = mTable.querySelectorAll("tr:first-child > td:first-child div ul")
    expect(unorderedInfirstCell).toExist();
    const items = unorderedInfirstCell[0].querySelectorAll("li")
    expect(items).toExist();
    expect(items.length).toBeGreaterThan(0);
  })
  
  it("topright cell in main table contains an image", () => {
    if (!mTable) {
      fail();
      return;
    }
    const topRightImg = mTable.querySelectorAll("tr:first-child > td:nth-child(2) div img")
    expect(topRightImg).toExist();
  })
  
  it("topright table contains a paragraph explaining the image", () => {
    if (!mTable) {
      fail();
      return;
    }
    const topRightPar = mTable.querySelectorAll("tr:first-child > td:nth-child(2) div img ~ p")
    expect(topRightPar).toExist();
  })
  
  it("third cell of table contains ordered list", () => {
    if (!mTable) {
      fail();
      return;
    }
    const orderedList = mTable.querySelectorAll("tr:nth-child(2) > td:nth-child(1) div ol")
    expect(orderedList).toExist();
  })
  
  it("third cell of table contains ordered list with lower-alpha style", () => {
    if (!mTable) {
      fail();
      return;
    }
    // First try <ol type="a">
    var orderedList = mTable.querySelectorAll("tr:nth-child(2) > td:nth-child(1) div ol[type=a]")
    if (orderedList && orderedList.length > 0) {
      return;
    }
    
    // Otherwise, look for list-style-type: lower-alpha
    const selectors = findSelectorWithPropAndValue("list-style-type", "lower-alpha");
    expect(selectors).not.toBeNull();
    expect(selectors.length).toBeGreaterThan(0);
    orderedList = mTable.querySelectorAll("tr:nth-child(2) > td:nth-child(1) div ol")
    expect(matchElementsWithStyles (orderedList, selectors)).toBeTruthy();
  })
  
  it("fourth cell of table contains a nested table", () => {
    if (!mTable) {
      fail();
      return;
    }
    const nestedTab = mTable.querySelector("tr:nth-child(2) > td:nth-child(2) div table")
    // const tabs = fourthCell.parentElement.querySelectorAll("table");
    expect(nestedTab).toExist();
  })
  
  it("fourth cell of table contains a nested table with border attribute", () => {
    if (!mTable) {
      fail();
      return;
    }
    const nestedTabWithBorder = mTable.querySelector("tr:nth-child(2) > td:nth-child(2) div table[border]")
    expect(nestedTabWithBorder).toExist();
  })
  
  it("fourth cell of table contains a nested table with id 'courseTable'", () => {
    if (!mTable) {
      fail();
      return;
    }
    const nestedTabWithId = mTable.querySelector("tr:nth-child(2) > td:nth-child(2) div table[id=courseTable]")
    expect(nestedTabWithId).toExist();
  })
  
  it("course table contains at least five rows", () => {
    if (!mTable) {
      fail();
      return;
    }
    const nestedTab = mTable.querySelector("tr:nth-child(2) > td:nth-child(2) div table")
    const rows = nestedTab.querySelectorAll("tr");
    expect(rows.length).toBeGreaterThan(4);
  })
  
  it("fifth cell of main table contains hyperlinks", () => {
    if (!mTable) {
      fail();
      return;
    }
    var fifthCell;
    fifthCell = mTable.querySelector("#mainTable > tbody > tr:nth-child(3) td:nth-child(1)");
    if (!fifthCell)
    fifthCell = mTable.querySelector("#mainTable > tr:nth-child(3) td:nth-child(1)");
    expect(fifthCell).toExist();
    const hlink = fifthCell.querySelectorAll("div a");
    expect(hlink).toExist();
  })
  
  it("fifth cell of main table contains hyperlinks with class 'links'", () => {
    if (!mTable) {
      fail();
      return;
    }
    var fifthCell;
    fifthCell = mTable.querySelector("#mainTable > tbody > tr:nth-child(3) td:nth-child(1)");
    if (!fifthCell)
    fifthCell = mTable.querySelector("#mainTable > tr:nth-child(3) td:nth-child(1)");
    expect(fifthCell).toExist();
    const hlink = fifthCell.querySelectorAll("div a[class~=links]");
    expect(hlink).toExist();
  })
  
  it("sixth cell of main table contains quotations", () => {
    if (!mTable) {
      fail();
      return;
    }
    var sixthCell;
    sixthCell = mTable.querySelector("#mainTable > tbody > tr:nth-child(3) td:nth-child(2)");
    if (!sixthCell)
    sixthCell = mTable.querySelector("#mainTable > tr:nth-child(3) td:nth-child(2)");
    expect(sixthCell).toExist();
    const quotation = sixthCell.querySelectorAll("div q")
    expect(quotation).toExist();
  })
  
  it("has quotation with class 'best'", () => {
    if (!mTable) {
      fail();
      return;
    }
    var sixthCell;
    sixthCell = mTable.querySelector("#mainTable > tbody > tr:nth-child(3) td:nth-child(2)");
    if (!sixthCell)
    sixthCell = mTable.querySelector("#mainTable > tr:nth-child(3) td:nth-child(2)");
    expect(sixthCell).toExist();
    const quotation = sixthCell.querySelectorAll("div q[class~=best]")
    expect(quotation).toExist();
  })
  
  it("the 'best' class is italicized", () => {
    const selectors = findSelectorWithPropAndValue("font-style", "italic");
    expect(selectors.length).toBeGreaterThan(0);
    for (k = 0; k < selectors.length; k++) {
      const s = selectors[k];
      if (s.selectorText == ".best") {
        expect(true).toBeTruthy();
        return;
      }
    }
    fail();
  })
  
  it('paragraphs in table use small font', () => {
    const selectors = findSelectorWithPropAndValue("font-size", "small");
    expect(selectors.length).toBeGreaterThan(0);
    const paras = page.querySelectorAll("table p");
    const out = matchElementsWithStyles(paras, selectors);
    expect(out).toBeTruthy();
  })
  
  it("'courseTable' uses nth-child pseudo class", () => {
    const selectors = findSelectorWithPropAndValue("text-align", "center");
    expect(selectors.length).toBeGreaterThan(0);
    const columns = page.querySelectorAll("#courseTable");
    const out = matchElementsWithStyles(columns, selectors);
    expect(out).toBeTruthy();

    // Confirm that pseudo-element :nth-child is used
    for (k = 0; k < selectors.length; k++) {
      const sel = selectors[k];
      if (sel.selectorText.indexOf("nth-child") != -1)
        return;    
    }
    fail();
  })
})
