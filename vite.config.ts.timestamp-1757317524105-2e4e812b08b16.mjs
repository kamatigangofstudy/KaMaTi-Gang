// vite.config.ts
import path5 from "node:path";
import { reactRouter } from "file:///home/project/node_modules/@react-router/dev/dist/vite.js";
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import babel2 from "file:///home/project/node_modules/vite-plugin-babel/dist/index.mjs";
import tsconfigPaths from "file:///home/project/node_modules/vite-tsconfig-paths/dist/index.js";

// plugins/addRenderIds.ts
import * as babel from "file:///home/project/node_modules/@babel/core/lib/index.js";
import { createHash } from "node:crypto";
function genId(file, loc) {
  return `render-${createHash("sha1").update(`${file}:${loc.line}:${loc.col}`).digest("hex").slice(0, 8)}`;
}
var idToJsx = { current: {} };
var getRenderIdVisitor = ({ filename }) => (api) => {
  const { types: t } = api;
  return {
    visitor: {
      JSXElement(path6) {
        const opening = path6.node.openingElement;
        if (!t.isJSXIdentifier(opening.name)) return;
        const tagName = opening.name.name;
        if (tagName !== tagName.toLowerCase()) return;
        if ([
          "html",
          "head",
          "body",
          "title",
          "meta",
          "link",
          "script",
          "style",
          "noscript",
          "base",
          "template",
          "iframe",
          "svg",
          "math",
          "slot",
          "picture",
          "source",
          "canvas",
          "video",
          "audio",
          "object",
          "embed",
          "param",
          "track"
        ].includes(tagName))
          return;
        const hasRenderId = opening.attributes.some(
          (attr) => t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === "renderId"
        );
        if (hasRenderId) return;
        const start = path6.node.loc?.start ?? {
          line: Math.floor(Math.random() * 1e3),
          column: Math.floor(Math.random() * 100)
        };
        const renderId = genId(filename, {
          line: start.line,
          col: start.column
        });
        const program = path6.findParent((p) => p.isProgram());
        if (!program) {
          console.warn(
            `No program found for ${filename} so unable to add CreatePolymorphicComponent import`
          );
          return;
        }
        idToJsx.current[renderId] = { code: path6.getSource() };
        const body = program.get("body");
        const alreadyImported = Array.isArray(body) && body.some(
          (p) => t.isImportDeclaration(p.node) && p.node.source.value === "@/__create/PolymorphicComponent"
        );
        if (!alreadyImported) {
          const importDecl = t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier("CreatePolymorphicComponent"))],
            t.stringLiteral("@/__create/PolymorphicComponent")
          );
          const firstImport = Array.isArray(body) ? body.findIndex((p) => p.isImportDeclaration()) : -1;
          if (firstImport === -1) {
            program.unshiftContainer("body", importDecl);
          } else {
            body[firstImport].insertBefore(importDecl);
          }
        }
        const newAttributes = [
          ...opening.attributes,
          t.jsxAttribute(t.jsxIdentifier("renderId"), t.stringLiteral(renderId)),
          t.jsxAttribute(t.jsxIdentifier("as"), t.stringLiteral(tagName))
        ];
        const newOpening = t.jsxOpeningElement(
          t.jsxIdentifier("CreatePolymorphicComponent"),
          newAttributes,
          opening.selfClosing
        );
        const newClosing = opening.selfClosing ? null : t.jsxClosingElement(t.jsxIdentifier("CreatePolymorphicComponent"));
        const wrapped = t.jsxElement(
          newOpening,
          newClosing,
          path6.node.children,
          opening.selfClosing
        );
        path6.replaceWith(wrapped);
      }
    }
  };
};
function addRenderIds() {
  return {
    name: "add-render-ids",
    enforce: "pre",
    async transform(code, id) {
      if (!/\.([cm]?[jt]sx)(\?noLayout)?$/.test(id)) {
        return null;
      }
      if (!id.includes("apps/web/src/")) {
        return null;
      }
      const result = await babel.transformAsync(code, {
        filename: id,
        sourceMaps: true,
        babelrc: false,
        configFile: false,
        presets: [["@babel/preset-react", { runtime: "automatic" }], "@babel/preset-typescript"],
        plugins: [getRenderIdVisitor({ filename: id })]
      });
      if (!result) return null;
      return { code: result.code ?? code, map: result.map };
    },
    api: {
      getRenderIdMap() {
        return idToJsx.current;
      }
    }
  };
}

// plugins/aliases.ts
import path from "node:path";
import { existsSync } from "node:fs";
var __vite_injected_original_dirname = "/home/project/plugins";
function aliases() {
  return {
    enforce: "pre",
    // run as early as possible
    name: "api-aware-alias",
    resolveId(source, importer) {
      if (!source.startsWith("@/")) return;
      const sourcePath = source.slice("@/".length);
      const extensions = [".ts", ".js", ".tsx", ".jsx"];
      for (const ext of extensions) {
        const filePath = path.resolve(__vite_injected_original_dirname, "../", "src", `./${sourcePath}${ext}`);
        if (existsSync(filePath)) {
          return filePath;
        }
      }
      return;
    }
  };
}

// plugins/console-to-parent.ts
function consoleToParent() {
  const virtId = "\0virtual:console-to-parent";
  return {
    name: "vite-console-to-parent",
    apply: "serve",
    resolveId(id) {
      if (id === virtId) return id;
    },
    load(id) {
      if (id !== virtId) return;
      return `
(function () {
  if (typeof window === 'undefined') return;
  if (!window || window.parent === window) return;

  const allow = '*';
  const allowed = (origin) =>
    allow === '*' ||
    (Array.isArray(allow) ? allow.includes(origin) : allow === origin);

  function safeStringify(value) {
    return JSON.stringify(value, (_k, v) => {
      if (v instanceof Date) return { __t: 'Date', v: v.toISOString() };
      if (v instanceof Error)
        return { __t: 'Error', v: { name: v.name, message: v.message, stack: v.stack } };
      return v;
    });
  }

  function format(args) {
    if (!args.length) return '';
    const first = args[0];
    if (typeof first !== 'string') {
      return args.map(String).join(' ');
    }
    let index = 1;
    const out = first.replace(/%[sdifjoOc%]/g, (m) => {
      if (m === '%%') return '%';
      if (m === '%c') { index++; return ''; } // swallow CSS styles
      if (index >= args.length) return m;
      const val = args[index++];
      switch (m) {
        case '%s': return String(val);
        case '%d':
        case '%i': return parseInt(val, 10);
        case '%f': return parseFloat(val);
        case '%j': try { return JSON.stringify(val); } catch { return '[Circular]'; }
        case '%o':
        case '%O': try { return String(val); } catch { return '[Object]'; }
        default: return m;
      }
    });
    const rest = args.slice(index).map(String).join(' ');
    return rest ? out + ' ' + rest : out;
  }

  ['log', 'info', 'warn', 'error', 'debug', 'table', 'trace'].forEach((level) => {
    const original = console[level]?.bind(console);
    console[level] = (...args) => {
      try {
        const message = {
          type: 'sandbox:web:console-write',
          __viteConsole: true,
          level,
          text: format(args),
          args: args.map(safeStringify),
        };
        window.parent.postMessage(message, '*');
      } catch (_) {}
      original?.(...args);
    };
  });
})();
      `;
    },
    transform(code, id) {
      if (id.includes("node_modules")) return;
      if (!id.includes("/apps/web/src/")) return;
      if (!/\.(js|ts|jsx|tsx)$/.test(id)) return;
      return {
        code: `import '${virtId}';
${code}`,
        map: null
      };
    }
  };
}

// plugins/layouts.ts
import fs from "node:fs";
import path2 from "node:path";
import { normalizePath } from "file:///home/project/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname2 = "/home/project/plugins";
var DEFAULT_PAGE_PATTERN = /\/page\.(jsx?)$/;
var DEFAULT_LAYOUT_FILES = ["layout.jsx"];
var DEFAULT_PARAM_PATTERN = /\[(\.{3})?([^\]]+)\]/g;
var NO_LAYOUT_QUERY = "?noLayout.jsx";
function layoutWrapperPlugin(userOpts = {}) {
  const opts = {
    pagePattern: userOpts.pagePattern ?? DEFAULT_PAGE_PATTERN,
    layoutFiles: userOpts.layoutFiles ?? DEFAULT_LAYOUT_FILES,
    srcRoots: userOpts.srcRoots ?? [path2.join(__vite_injected_original_dirname2, "../src")]
  };
  let root = "";
  return {
    name: "vite-react-hierarchical-layouts",
    enforce: "pre",
    configResolved(c) {
      root = normalizePath(c.root);
    },
    /* ——— turn any   src/foo/bar/page.tsx   into a wrapper ——— */
    async transform(code, id) {
      if (opts.pagePattern.test(id) && !id.includes(NO_LAYOUT_QUERY)) {
        return buildWrapper.call(this, id);
      }
      return null;
    }
  };
  function collectLayouts(pagePath, o) {
    const layouts = [];
    let dir = path2.dirname(pagePath);
    const stopDirs = o.srcRoots.map((r) => path2.resolve(r));
    while (true) {
      for (const name of o.layoutFiles) {
        const candidate = path2.join(dir, name);
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          const hasExport = fs.readFileSync(candidate, "utf-8").includes("export");
          layouts.unshift({ absFile: candidate, hasExport });
        }
      }
      if (stopDirs.includes(dir)) break;
      const parent = path2.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
    return layouts;
  }
  function extractRouteParams(pagePath, paramPattern) {
    const relativePath = normalizePath(pagePath);
    const params = [];
    const matches = relativePath.matchAll(new RegExp(paramPattern));
    for (const match of matches) {
      if (match[2]) {
        params.push(match[2]);
      }
    }
    return params;
  }
  function buildWrapper(pagePath) {
    const layouts = collectLayouts(pagePath, opts);
    for (const layout of layouts) {
      this.addWatchFile(layout.absFile);
    }
    const routeParams = extractRouteParams(pagePath, DEFAULT_PARAM_PATTERN);
    const hasSpreadParams = /\[\.{3}[^\]]+\]/.test(normalizePath(pagePath));
    const imports = [];
    const opening = [];
    const closing = [];
    layouts.forEach(({ absFile, hasExport }, i2) => {
      const varName = `Layout${i2}`;
      imports.push(`import ${varName} from ${JSON.stringify(absFile)};`);
      if (hasExport) {
        opening.push(`<${varName}>`);
        closing.unshift(`</${varName}>`);
      }
    });
    imports.push(`import Page from ${JSON.stringify(pagePath + NO_LAYOUT_QUERY)};`);
    if (routeParams.length > 0) {
      imports.push(
        `import { useParams${hasSpreadParams ? ", useLocation" : ""} } from 'react-router-dom';`
      );
    }
    return `
${imports.join("\n")}

export default function WrappedPage(props) {
  ${routeParams.length > 0 ? "const params = useParams();" : ""}
  ${hasSpreadParams ? "const location = useLocation();" : ""}
  return (
    ${opening.join("\n    ")}
      <Page {...props}${routeParams.length > 0 ? routeParams.map(
      (param) => pagePath.includes(`[...${param}]`) ? (
        // collect the rest of the path for spread params
        `${param}={location.pathname
                      .split('/')
                      .slice(
                        location.pathname
                          .split('/')
                          .findIndex(Boolean) + 1
                      )}`
      ) : `${param}={params.${param}}`
    ).join(" ") : ""} />
    ${closing.join("\n    ")}
  );
}
`;
  }
}

// plugins/loadFontsFromTailwindSource.ts
import "file:///home/project/node_modules/lodash/lodash.js";
import fs2 from "node:fs";
import fg from "file:///home/project/node_modules/fast-glob/out/index.js";
var GOOGLE_FONTS = new Map(
  [
    "ABeeZee",
    "ADLaM Display",
    "AR One Sans",
    "Abel",
    "Abhaya Libre",
    "Aboreto",
    "Abril Fatface",
    "Abyssinica SIL",
    "Aclonica",
    "Acme",
    "Actor",
    "Adamina",
    "Advent Pro",
    "Agbalumo",
    "Agdasima",
    "Aguafina Script",
    "Akatab",
    "Akaya Kanadaka",
    "Akaya Telivigala",
    "Akronim",
    "Akshar",
    "Aladin",
    "Alata",
    "Alatsi",
    "Albert Sans",
    "Aldrich",
    "Alef",
    "Alegreya",
    "Alegreya SC",
    "Alegreya Sans",
    "Alegreya Sans SC",
    "Aleo",
    "Alex Brush",
    "Alexandria",
    "Alfa Slab One",
    "Alice",
    "Alike",
    "Alike Angular",
    "Alkalami",
    "Alkatra",
    "Allan",
    "Allerta",
    "Allerta Stencil",
    "Allison",
    "Allura",
    "Almarai",
    "Almendra",
    "Almendra Display",
    "Almendra SC",
    "Alumni Sans",
    "Alumni Sans Collegiate One",
    "Alumni Sans Inline One",
    "Alumni Sans Pinstripe",
    "Amarante",
    "Amaranth",
    "Amatic SC",
    "Amethysta",
    "Amiko",
    "Amiri",
    "Amiri Quran",
    "Amita",
    "Anaheim",
    "Andada Pro",
    "Andika",
    "Anek Bangla",
    "Anek Devanagari",
    "Anek Gujarati",
    "Anek Gurmukhi",
    "Anek Kannada",
    "Anek Latin",
    "Anek Malayalam",
    "Anek Odia",
    "Anek Tamil",
    "Anek Telugu",
    "Angkor",
    "Annie Use Your Telescope",
    "Anonymous Pro",
    "Antic",
    "Antic Didone",
    "Antic Slab",
    "Anton",
    "Antonio",
    "Anuphan",
    "Anybody",
    "Aoboshi One",
    "Arapey",
    "Arbutus",
    "Arbutus Slab",
    "Architects Daughter",
    "Archivo",
    "Archivo Black",
    "Archivo Narrow",
    "Are You Serious",
    "Aref Ruqaa",
    "Aref Ruqaa Ink",
    "Arima",
    "Arimo",
    "Arizonia",
    "Armata",
    "Arsenal",
    "Artifika",
    "Arvo",
    "Arya",
    "Asap",
    "Asap Condensed",
    "Asar",
    "Asset",
    "Assistant",
    "Astloch",
    "Asul",
    "Athiti",
    "Atkinson Hyperlegible",
    "Atma",
    "Atomic Age",
    "Aubrey",
    "Audiowide",
    "Autour One",
    "Average",
    "Average Sans",
    "Averia Gruesa Libre",
    "Averia Libre",
    "Averia Sans Libre",
    "Averia Serif Libre",
    "Azeret Mono",
    "B612",
    "B612 Mono",
    "BIZ UDGothic",
    "BIZ UDMincho",
    "BIZ UDPGothic",
    "BIZ UDPMincho",
    "Babylonica",
    "Bacasime Antique",
    "Bad Script",
    "Bagel Fat One",
    "Bahiana",
    "Bahianita",
    "Bai Jamjuree",
    "Bakbak One",
    "Ballet",
    "Baloo 2",
    "Baloo Bhai 2",
    "Baloo Bhaijaan 2",
    "Baloo Bhaina 2",
    "Baloo Chettan 2",
    "Baloo Da 2",
    "Baloo Paaji 2",
    "Baloo Tamma 2",
    "Baloo Tammudu 2",
    "Baloo Thambi 2",
    "Balsamiq Sans",
    "Balthazar",
    "Bangers",
    "Barlow",
    "Barlow Condensed",
    "Barlow Semi Condensed",
    "Barriecito",
    "Barrio",
    "Basic",
    "Baskervville",
    "Battambang",
    "Baumans",
    "Bayon",
    "Be Vietnam Pro",
    "Beau Rivage",
    "Bebas Neue",
    "Belanosima",
    "Belgrano",
    "Bellefair",
    "Belleza",
    "Bellota",
    "Bellota Text",
    "BenchNine",
    "Benne",
    "Bentham",
    "Berkshire Swash",
    "Besley",
    "Beth Ellen",
    "Bevan",
    "BhuTuka Expanded One",
    "Big Shoulders Display",
    "Big Shoulders Inline Display",
    "Big Shoulders Inline Text",
    "Big Shoulders Stencil Display",
    "Big Shoulders Stencil Text",
    "Big Shoulders Text",
    "Bigelow Rules",
    "Bigshot One",
    "Bilbo",
    "Bilbo Swash Caps",
    "BioRhyme",
    "BioRhyme Expanded",
    "Birthstone",
    "Birthstone Bounce",
    "Biryani",
    "Bitter",
    "Black And White Picture",
    "Black Han Sans",
    "Black Ops One",
    "Blaka",
    "Blaka Hollow",
    "Blaka Ink",
    "Blinker",
    "Bodoni Moda",
    "Bokor",
    "Bona Nova",
    "Bonbon",
    "Bonheur Royale",
    "Boogaloo",
    "Borel",
    "Bowlby One",
    "Bowlby One SC",
    "Braah One",
    "Brawler",
    "Bree Serif",
    "Bricolage Grotesque",
    "Bruno Ace",
    "Bruno Ace SC",
    "Brygada 1918",
    "Bubblegum Sans",
    "Bubbler One",
    "Buda",
    "Buenard",
    "Bungee",
    "Bungee Hairline",
    "Bungee Inline",
    "Bungee Outline",
    "Bungee Shade",
    "Bungee Spice",
    "Butcherman",
    "Butterfly Kids",
    "Cabin",
    "Cabin Condensed",
    "Cabin Sketch",
    "Caesar Dressing",
    "Cagliostro",
    "Cairo",
    "Cairo Play",
    "Caladea",
    "Calistoga",
    "Calligraffitti",
    "Cambay",
    "Cambo",
    "Candal",
    "Cantarell",
    "Cantata One",
    "Cantora One",
    "Caprasimo",
    "Capriola",
    "Caramel",
    "Carattere",
    "Cardo",
    "Carlito",
    "Carme",
    "Carrois Gothic",
    "Carrois Gothic SC",
    "Carter One",
    "Castoro",
    "Castoro Titling",
    "Catamaran",
    "Caudex",
    "Caveat",
    "Caveat Brush",
    "Cedarville Cursive",
    "Ceviche One",
    "Chakra Petch",
    "Changa",
    "Changa One",
    "Chango",
    "Charis SIL",
    "Charm",
    "Charmonman",
    "Chathura",
    "Chau Philomene One",
    "Chela One",
    "Chelsea Market",
    "Chenla",
    "Cherish",
    "Cherry Bomb One",
    "Cherry Cream Soda",
    "Cherry Swash",
    "Chewy",
    "Chicle",
    "Chilanka",
    "Chivo",
    "Chivo Mono",
    "Chokokutai",
    "Chonburi",
    "Cinzel",
    "Cinzel Decorative",
    "Clicker Script",
    "Climate Crisis",
    "Coda",
    "Codystar",
    "Coiny",
    "Combo",
    "Comfortaa",
    "Comforter",
    "Comforter Brush",
    "Comic Neue",
    "Coming Soon",
    "Comme",
    "Commissioner",
    "Concert One",
    "Condiment",
    "Content",
    "Contrail One",
    "Convergence",
    "Cookie",
    "Copse",
    "Corben",
    "Corinthia",
    "Cormorant",
    "Cormorant Garamond",
    "Cormorant Infant",
    "Cormorant SC",
    "Cormorant Unicase",
    "Cormorant Upright",
    "Courgette",
    "Courier Prime",
    "Cousine",
    "Coustard",
    "Covered By Your Grace",
    "Crafty Girls",
    "Creepster",
    "Crete Round",
    "Crimson Pro",
    "Crimson Text",
    "Croissant One",
    "Crushed",
    "Cuprum",
    "Cute Font",
    "Cutive",
    "Cutive Mono",
    "DM Mono",
    "DM Sans",
    "DM Serif Display",
    "DM Serif Text",
    "Dai Banna SIL",
    "Damion",
    "Dancing Script",
    "Dangrek",
    "Darker Grotesque",
    "Darumadrop One",
    "David Libre",
    "Dawning of a New Day",
    "Days One",
    "Dekko",
    "Dela Gothic One",
    "Delicious Handrawn",
    "Delius",
    "Delius Swash Caps",
    "Delius Unicase",
    "Della Respira",
    "Denk One",
    "Devonshire",
    "Dhurjati",
    "Didact Gothic",
    "Diphylleia",
    "Diplomata",
    "Diplomata SC",
    "Do Hyeon",
    "Dokdo",
    "Domine",
    "Donegal One",
    "Dongle",
    "Doppio One",
    "Dorsa",
    "Dosis",
    "DotGothic16",
    "Dr Sugiyama",
    "Duru Sans",
    "DynaPuff",
    "Dynalight",
    "EB Garamond",
    "Eagle Lake",
    "East Sea Dokdo",
    "Eater",
    "Economica",
    "Eczar",
    "Edu NSW ACT Foundation",
    "Edu QLD Beginner",
    "Edu SA Beginner",
    "Edu TAS Beginner",
    "Edu VIC WA NT Beginner",
    "El Messiri",
    "Electrolize",
    "Elsie",
    "Elsie Swash Caps",
    "Emblema One",
    "Emilys Candy",
    "Encode Sans",
    "Encode Sans Condensed",
    "Encode Sans Expanded",
    "Encode Sans SC",
    "Encode Sans Semi Condensed",
    "Encode Sans Semi Expanded",
    "Engagement",
    "Englebert",
    "Enriqueta",
    "Ephesis",
    "Epilogue",
    "Erica One",
    "Esteban",
    "Estonia",
    "Euphoria Script",
    "Ewert",
    "Exo",
    "Exo 2",
    "Expletus Sans",
    "Explora",
    "Fahkwang",
    "Familjen Grotesk",
    "Fanwood Text",
    "Farro",
    "Farsan",
    "Fascinate",
    "Fascinate Inline",
    "Faster One",
    "Fasthand",
    "Fauna One",
    "Faustina",
    "Federant",
    "Federo",
    "Felipa",
    "Fenix",
    "Festive",
    "Figtree",
    "Finger Paint",
    "Finlandica",
    "Fira Code",
    "Fira Mono",
    "Fira Sans",
    "Fira Sans Condensed",
    "Fira Sans Extra Condensed",
    "Fjalla One",
    "Fjord One",
    "Flamenco",
    "Flavors",
    "Fleur De Leah",
    "Flow Block",
    "Flow Circular",
    "Flow Rounded",
    "Foldit",
    "Fondamento",
    "Fontdiner Swanky",
    "Forum",
    "Fragment Mono",
    "Francois One",
    "Frank Ruhl Libre",
    "Fraunces",
    "Freckle Face",
    "Fredericka the Great",
    "Fredoka",
    "Freehand",
    "Fresca",
    "Frijole",
    "Fruktur",
    "Fugaz One",
    "Fuggles",
    "Fuzzy Bubbles",
    "GFS Didot",
    "GFS Neohellenic",
    "Gabarito",
    "Gabriela",
    "Gaegu",
    "Gafata",
    "Gajraj One",
    "Galada",
    "Galdeano",
    "Galindo",
    "Gamja Flower",
    "Gantari",
    "Gasoek One",
    "Gayathri",
    "Gelasio",
    "Gemunu Libre",
    "Genos",
    "Gentium Book Plus",
    "Gentium Plus",
    "Geo",
    "Geologica",
    "Georama",
    "Geostar",
    "Geostar Fill",
    "Germania One",
    "Gideon Roman",
    "Gidugu",
    "Gilda Display",
    "Girassol",
    "Give You Glory",
    "Glass Antiqua",
    "Glegoo",
    "Gloock",
    "Gloria Hallelujah",
    "Glory",
    "Gluten",
    "Goblin One",
    "Gochi Hand",
    "Goldman",
    "Golos Text",
    "Gorditas",
    "Gothic A1",
    "Gotu",
    "Goudy Bookletter 1911",
    "Gowun Batang",
    "Gowun Dodum",
    "Graduate",
    "Grand Hotel",
    "Grandiflora One",
    "Grandstander",
    "Grape Nuts",
    "Gravitas One",
    "Great Vibes",
    "Grechen Fuemen",
    "Grenze",
    "Grenze Gotisch",
    "Grey Qo",
    "Griffy",
    "Gruppo",
    "Gudea",
    "Gugi",
    "Gulzar",
    "Gupter",
    "Gurajada",
    "Gwendolyn",
    "Habibi",
    "Hachi Maru Pop",
    "Hahmlet",
    "Halant",
    "Hammersmith One",
    "Hanalei",
    "Hanalei Fill",
    "Handjet",
    "Handlee",
    "Hanken Grotesk",
    "Hanuman",
    "Happy Monkey",
    "Harmattan",
    "Headland One",
    "Heebo",
    "Henny Penny",
    "Hepta Slab",
    "Herr Von Muellerhoff",
    "Hi Melody",
    "Hina Mincho",
    "Hind",
    "Hind Guntur",
    "Hind Madurai",
    "Hind Siliguri",
    "Hind Vadodara",
    "Holtwood One SC",
    "Homemade Apple",
    "Homenaje",
    "Hubballi",
    "Hurricane",
    "IBM Plex Mono",
    "IBM Plex Sans",
    "IBM Plex Sans Arabic",
    "IBM Plex Sans Condensed",
    "IBM Plex Sans Devanagari",
    "IBM Plex Sans Hebrew",
    "IBM Plex Sans JP",
    "IBM Plex Sans KR",
    "IBM Plex Sans Thai",
    "IBM Plex Sans Thai Looped",
    "IBM Plex Serif",
    "IM Fell DW Pica",
    "IM Fell DW Pica SC",
    "IM Fell Double Pica",
    "IM Fell Double Pica SC",
    "IM Fell English",
    "IM Fell English SC",
    "IM Fell French Canon",
    "IM Fell French Canon SC",
    "IM Fell Great Primer",
    "IM Fell Great Primer SC",
    "Ibarra Real Nova",
    "Iceberg",
    "Iceland",
    "Imbue",
    "Imperial Script",
    "Imprima",
    "Inclusive Sans",
    "Inconsolata",
    "Inder",
    "Indie Flower",
    "Ingrid Darling",
    "Inika",
    "Inknut Antiqua",
    "Inria Sans",
    "Inria Serif",
    "Inspiration",
    "Instrument Sans",
    "Instrument Serif",
    "Inter",
    "Inter Tight",
    "Irish Grover",
    "Island Moments",
    "Istok Web",
    "Italiana",
    "Italianno",
    "Itim",
    "Jacques Francois",
    "Jacques Francois Shadow",
    "Jaldi",
    "JetBrains Mono",
    "Jim Nightshade",
    "Joan",
    "Jockey One",
    "Jolly Lodger",
    "Jomhuria",
    "Jomolhari",
    "Josefin Sans",
    "Josefin Slab",
    "Jost",
    "Joti One",
    "Jua",
    "Judson",
    "Julee",
    "Julius Sans One",
    "Junge",
    "Jura",
    "Just Another Hand",
    "Just Me Again Down Here",
    "K2D",
    "Kablammo",
    "Kadwa",
    "Kaisei Decol",
    "Kaisei HarunoUmi",
    "Kaisei Opti",
    "Kaisei Tokumin",
    "Kalam",
    "Kameron",
    "Kanit",
    "Kantumruy Pro",
    "Karantina",
    "Karla",
    "Karma",
    "Katibeh",
    "Kaushan Script",
    "Kavivanar",
    "Kavoon",
    "Kay Pho Du",
    "Kdam Thmor Pro",
    "Keania One",
    "Kelly Slab",
    "Kenia",
    "Khand",
    "Khmer",
    "Khula",
    "Kings",
    "Kirang Haerang",
    "Kite One",
    "Kiwi Maru",
    "Klee One",
    "Knewave",
    "KoHo",
    "Kodchasan",
    "Koh Santepheap",
    "Kolker Brush",
    "Konkhmer Sleokchher",
    "Kosugi",
    "Kosugi Maru",
    "Kotta One",
    "Koulen",
    "Kranky",
    "Kreon",
    "Kristi",
    "Krona One",
    "Krub",
    "Kufam",
    "Kulim Park",
    "Kumar One",
    "Kumar One Outline",
    "Kumbh Sans",
    "Kurale",
    "La Belle Aurore",
    "Labrada",
    "Lacquer",
    "Laila",
    "Lakki Reddy",
    "Lalezar",
    "Lancelot",
    "Langar",
    "Lateef",
    "Lato",
    "Lavishly Yours",
    "League Gothic",
    "League Script",
    "League Spartan",
    "Leckerli One",
    "Ledger",
    "Lekton",
    "Lemon",
    "Lemonada",
    "Lexend",
    "Lexend Deca",
    "Lexend Exa",
    "Lexend Giga",
    "Lexend Mega",
    "Lexend Peta",
    "Lexend Tera",
    "Lexend Zetta",
    "Libre Barcode 128",
    "Libre Barcode 128 Text",
    "Libre Barcode 39",
    "Libre Barcode 39 Extended",
    "Libre Barcode 39 Extended Text",
    "Libre Barcode 39 Text",
    "Libre Barcode EAN13 Text",
    "Libre Baskerville",
    "Libre Bodoni",
    "Libre Caslon Display",
    "Libre Caslon Text",
    "Libre Franklin",
    "Licorice",
    "Life Savers",
    "Lilita One",
    "Lily Script One",
    "Limelight",
    "Linden Hill",
    "Linefont",
    "Lisu Bosa",
    "Literata",
    "Liu Jian Mao Cao",
    "Livvic",
    "Lobster",
    "Lobster Two",
    "Londrina Outline",
    "Londrina Shadow",
    "Londrina Sketch",
    "Londrina Solid",
    "Long Cang",
    "Lora",
    "Love Light",
    "Love Ya Like A Sister",
    "Loved by the King",
    "Lovers Quarrel",
    "Luckiest Guy",
    "Lugrasimo",
    "Lumanosimo",
    "Lunasima",
    "Lusitana",
    "Lustria",
    "Luxurious Roman",
    "Luxurious Script",
    "M PLUS 1",
    "M PLUS 1 Code",
    "M PLUS 1p",
    "M PLUS 2",
    "M PLUS Code Latin",
    "M PLUS Rounded 1c",
    "Ma Shan Zheng",
    "Macondo",
    "Macondo Swash Caps",
    "Mada",
    "Magra",
    "Maiden Orange",
    "Maitree",
    "Major Mono Display",
    "Mako",
    "Mali",
    "Mallanna",
    "Mandali",
    "Manjari",
    "Manrope",
    "Mansalva",
    "Manuale",
    "Marcellus",
    "Marcellus SC",
    "Marck Script",
    "Margarine",
    "Marhey",
    "Markazi Text",
    "Marko One",
    "Marmelad",
    "Martel",
    "Martel Sans",
    "Martian Mono",
    "Marvel",
    "Mate",
    "Mate SC",
    "Maven Pro",
    "McLaren",
    "Mea Culpa",
    "Meddon",
    "MedievalSharp",
    "Medula One",
    "Meera Inimai",
    "Megrim",
    "Meie Script",
    "Meow Script",
    "Merienda",
    "Merriweather",
    "Merriweather Sans",
    "Metal",
    "Metal Mania",
    "Metamorphous",
    "Metrophobic",
    "Michroma",
    "Milonga",
    "Miltonian",
    "Miltonian Tattoo",
    "Mina",
    "Mingzat",
    "Miniver",
    "Miriam Libre",
    "Mirza",
    "Miss Fajardose",
    "Mitr",
    "Mochiy Pop One",
    "Mochiy Pop P One",
    "Modak",
    "Modern Antiqua",
    "Mogra",
    "Mohave",
    "Moirai One",
    "Molengo",
    "Molle",
    "Monda",
    "Monofett",
    "Monomaniac One",
    "Monoton",
    "Monsieur La Doulaise",
    "Montaga",
    "Montagu Slab",
    "MonteCarlo",
    "Montez",
    "Montserrat",
    "Montserrat Alternates",
    "Montserrat Subrayada",
    "Moo Lah Lah",
    "Mooli",
    "Moon Dance",
    "Moul",
    "Moulpali",
    "Mountains of Christmas",
    "Mouse Memoirs",
    "Mr Bedfort",
    "Mr Dafoe",
    "Mr De Haviland",
    "Mrs Saint Delafield",
    "Mrs Sheppards",
    "Ms Madi",
    "Mukta",
    "Mukta Mahee",
    "Mukta Malar",
    "Mukta Vaani",
    "Mulish",
    "Murecho",
    "MuseoModerno",
    "My Soul",
    "Mynerve",
    "Mystery Quest",
    "NTR",
    "Nabla",
    "Nanum Brush Script",
    "Nanum Gothic",
    "Nanum Gothic Coding",
    "Nanum Myeongjo",
    "Nanum Pen Script",
    "Narnoor",
    "Neonderthaw",
    "Nerko One",
    "Neucha",
    "Neuton",
    "New Rocker",
    "New Tegomin",
    "News Cycle",
    "Newsreader",
    "Niconne",
    "Niramit",
    "Nixie One",
    "Nobile",
    "Nokora",
    "Norican",
    "Nosifer",
    "Notable",
    "Nothing You Could Do",
    "Noticia Text",
    "Noto Color Emoji",
    "Noto Emoji",
    "Noto Kufi Arabic",
    "Noto Music",
    "Noto Naskh Arabic",
    "Noto Nastaliq Urdu",
    "Noto Rashi Hebrew",
    "Noto Sans",
    "Noto Sans Adlam",
    "Noto Sans Adlam Unjoined",
    "Noto Sans Anatolian Hieroglyphs",
    "Noto Sans Arabic",
    "Noto Sans Armenian",
    "Noto Sans Avestan",
    "Noto Sans Balinese",
    "Noto Sans Bamum",
    "Noto Sans Bassa Vah",
    "Noto Sans Batak",
    "Noto Sans Bengali",
    "Noto Sans Bhaiksuki",
    "Noto Sans Brahmi",
    "Noto Sans Buginese",
    "Noto Sans Buhid",
    "Noto Sans Canadian Aboriginal",
    "Noto Sans Carian",
    "Noto Sans Caucasian Albanian",
    "Noto Sans Chakma",
    "Noto Sans Cham",
    "Noto Sans Cherokee",
    "Noto Sans Chorasmian",
    "Noto Sans Coptic",
    "Noto Sans Cuneiform",
    "Noto Sans Cypriot",
    "Noto Sans Cypro Minoan",
    "Noto Sans Deseret",
    "Noto Sans Devanagari",
    "Noto Sans Display",
    "Noto Sans Duployan",
    "Noto Sans Egyptian Hieroglyphs",
    "Noto Sans Elbasan",
    "Noto Sans Elymaic",
    "Noto Sans Ethiopic",
    "Noto Sans Georgian",
    "Noto Sans Glagolitic",
    "Noto Sans Gothic",
    "Noto Sans Grantha",
    "Noto Sans Gujarati",
    "Noto Sans Gunjala Gondi",
    "Noto Sans Gurmukhi",
    "Noto Sans HK",
    "Noto Sans Hanifi Rohingya",
    "Noto Sans Hanunoo",
    "Noto Sans Hatran",
    "Noto Sans Hebrew",
    "Noto Sans Imperial Aramaic",
    "Noto Sans Indic Siyaq Numbers",
    "Noto Sans Inscriptional Pahlavi",
    "Noto Sans Inscriptional Parthian",
    "Noto Sans JP",
    "Noto Sans Javanese",
    "Noto Sans KR",
    "Noto Sans Kaithi",
    "Noto Sans Kannada",
    "Noto Sans Kawi",
    "Noto Sans Kayah Li",
    "Noto Sans Kharoshthi",
    "Noto Sans Khmer",
    "Noto Sans Khojki",
    "Noto Sans Khudawadi",
    "Noto Sans Lao",
    "Noto Sans Lao Looped",
    "Noto Sans Lepcha",
    "Noto Sans Limbu",
    "Noto Sans Linear A",
    "Noto Sans Linear B",
    "Noto Sans Lisu",
    "Noto Sans Lycian",
    "Noto Sans Lydian",
    "Noto Sans Mahajani",
    "Noto Sans Malayalam",
    "Noto Sans Mandaic",
    "Noto Sans Manichaean",
    "Noto Sans Marchen",
    "Noto Sans Masaram Gondi",
    "Noto Sans Math",
    "Noto Sans Mayan Numerals",
    "Noto Sans Medefaidrin",
    "Noto Sans Meetei Mayek",
    "Noto Sans Mende Kikakui",
    "Noto Sans Meroitic",
    "Noto Sans Miao",
    "Noto Sans Modi",
    "Noto Sans Mongolian",
    "Noto Sans Mono",
    "Noto Sans Mro",
    "Noto Sans Multani",
    "Noto Sans Myanmar",
    "Noto Sans NKo",
    "Noto Sans NKo Unjoined",
    "Noto Sans Nabataean",
    "Noto Sans Nag Mundari",
    "Noto Sans Nandinagari",
    "Noto Sans New Tai Lue",
    "Noto Sans Newa",
    "Noto Sans Nushu",
    "Noto Sans Ogham",
    "Noto Sans Ol Chiki",
    "Noto Sans Old Hungarian",
    "Noto Sans Old Italic",
    "Noto Sans Old North Arabian",
    "Noto Sans Old Permic",
    "Noto Sans Old Persian",
    "Noto Sans Old Sogdian",
    "Noto Sans Old South Arabian",
    "Noto Sans Old Turkic",
    "Noto Sans Oriya",
    "Noto Sans Osage",
    "Noto Sans Osmanya",
    "Noto Sans Pahawh Hmong",
    "Noto Sans Palmyrene",
    "Noto Sans Pau Cin Hau",
    "Noto Sans Phags Pa",
    "Noto Sans Phoenician",
    "Noto Sans Psalter Pahlavi",
    "Noto Sans Rejang",
    "Noto Sans Runic",
    "Noto Sans SC",
    "Noto Sans Samaritan",
    "Noto Sans Saurashtra",
    "Noto Sans Sharada",
    "Noto Sans Shavian",
    "Noto Sans Siddham",
    "Noto Sans SignWriting",
    "Noto Sans Sinhala",
    "Noto Sans Sogdian",
    "Noto Sans Sora Sompeng",
    "Noto Sans Soyombo",
    "Noto Sans Sundanese",
    "Noto Sans Syloti Nagri",
    "Noto Sans Symbols",
    "Noto Sans Symbols 2",
    "Noto Sans Syriac",
    "Noto Sans Syriac Eastern",
    "Noto Sans TC",
    "Noto Sans Tagalog",
    "Noto Sans Tagbanwa",
    "Noto Sans Tai Le",
    "Noto Sans Tai Tham",
    "Noto Sans Tai Viet",
    "Noto Sans Takri",
    "Noto Sans Tamil",
    "Noto Sans Tamil Supplement",
    "Noto Sans Tangsa",
    "Noto Sans Telugu",
    "Noto Sans Thaana",
    "Noto Sans Thai",
    "Noto Sans Thai Looped",
    "Noto Sans Tifinagh",
    "Noto Sans Tirhuta",
    "Noto Sans Ugaritic",
    "Noto Sans Vai",
    "Noto Sans Vithkuqi",
    "Noto Sans Wancho",
    "Noto Sans Warang Citi",
    "Noto Sans Yi",
    "Noto Sans Zanabazar Square",
    "Noto Serif",
    "Noto Serif Ahom",
    "Noto Serif Armenian",
    "Noto Serif Balinese",
    "Noto Serif Bengali",
    "Noto Serif Devanagari",
    "Noto Serif Display",
    "Noto Serif Dogra",
    "Noto Serif Ethiopic",
    "Noto Serif Georgian",
    "Noto Serif Grantha",
    "Noto Serif Gujarati",
    "Noto Serif Gurmukhi",
    "Noto Serif HK",
    "Noto Serif Hebrew",
    "Noto Serif JP",
    "Noto Serif KR",
    "Noto Serif Kannada",
    "Noto Serif Khitan Small Script",
    "Noto Serif Khmer",
    "Noto Serif Khojki",
    "Noto Serif Lao",
    "Noto Serif Makasar",
    "Noto Serif Malayalam",
    "Noto Serif Myanmar",
    "Noto Serif NP Hmong",
    "Noto Serif Old Uyghur",
    "Noto Serif Oriya",
    "Noto Serif Ottoman Siyaq",
    "Noto Serif SC",
    "Noto Serif Sinhala",
    "Noto Serif TC",
    "Noto Serif Tamil",
    "Noto Serif Tangut",
    "Noto Serif Telugu",
    "Noto Serif Thai",
    "Noto Serif Tibetan",
    "Noto Serif Toto",
    "Noto Serif Vithkuqi",
    "Noto Serif Yezidi",
    "Noto Traditional Nushu",
    "Nova Cut",
    "Nova Flat",
    "Nova Mono",
    "Nova Oval",
    "Nova Round",
    "Nova Script",
    "Nova Slim",
    "Nova Square",
    "Numans",
    "Nunito",
    "Nunito Sans",
    "Nuosu SIL",
    "Odibee Sans",
    "Odor Mean Chey",
    "Offside",
    "Oi",
    "Old Standard TT",
    "Oldenburg",
    "Ole",
    "Oleo Script",
    "Oleo Script Swash Caps",
    "Onest",
    "Oooh Baby",
    "Open Sans",
    "Oranienbaum",
    "Orbit",
    "Orbitron",
    "Oregano",
    "Orelega One",
    "Orienta",
    "Original Surfer",
    "Oswald",
    "Outfit",
    "Over the Rainbow",
    "Overlock",
    "Overlock SC",
    "Overpass",
    "Overpass Mono",
    "Ovo",
    "Oxanium",
    "Oxygen",
    "Oxygen Mono",
    "PT Mono",
    "PT Sans",
    "PT Sans Caption",
    "PT Sans Narrow",
    "PT Serif",
    "PT Serif Caption",
    "Pacifico",
    "Padauk",
    "Padyakke Expanded One",
    "Palanquin",
    "Palanquin Dark",
    "Palette Mosaic",
    "Pangolin",
    "Paprika",
    "Parisienne",
    "Passero One",
    "Passion One",
    "Passions Conflict",
    "Pathway Extreme",
    "Pathway Gothic One",
    "Patrick Hand",
    "Patrick Hand SC",
    "Pattaya",
    "Patua One",
    "Pavanam",
    "Paytone One",
    "Peddana",
    "Peralta",
    "Permanent Marker",
    "Petemoss",
    "Petit Formal Script",
    "Petrona",
    "Philosopher",
    "Phudu",
    "Piazzolla",
    "Piedra",
    "Pinyon Script",
    "Pirata One",
    "Pixelify Sans",
    "Plaster",
    "Play",
    "Playball",
    "Playfair",
    "Playfair Display",
    "Playfair Display SC",
    "Playpen Sans",
    "Plus Jakarta Sans",
    "Podkova",
    "Poiret One",
    "Poller One",
    "Poltawski Nowy",
    "Poly",
    "Pompiere",
    "Pontano Sans",
    "Poor Story",
    "Poppins",
    "Port Lligat Sans",
    "Port Lligat Slab",
    "Potta One",
    "Pragati Narrow",
    "Praise",
    "Prata",
    "Preahvihear",
    "Press Start 2P",
    "Pridi",
    "Princess Sofia",
    "Prociono",
    "Prompt",
    "Prosto One",
    "Proza Libre",
    "Public Sans",
    "Puppies Play",
    "Puritan",
    "Purple Purse",
    "Qahiri",
    "Quando",
    "Quantico",
    "Quattrocento",
    "Quattrocento Sans",
    "Questrial",
    "Quicksand",
    "Quintessential",
    "Qwigley",
    "Qwitcher Grypen",
    "REM",
    "Racing Sans One",
    "Radio Canada",
    "Radley",
    "Rajdhani",
    "Rakkas",
    "Raleway",
    "Raleway Dots",
    "Ramabhadra",
    "Ramaraja",
    "Rambla",
    "Rammetto One",
    "Rampart One",
    "Ranchers",
    "Rancho",
    "Ranga",
    "Rasa",
    "Rationale",
    "Ravi Prakash",
    "Readex Pro",
    "Recursive",
    "Red Hat Display",
    "Red Hat Mono",
    "Red Hat Text",
    "Red Rose",
    "Redacted",
    "Redacted Script",
    "Redressed",
    "Reem Kufi",
    "Reem Kufi Fun",
    "Reem Kufi Ink",
    "Reenie Beanie",
    "Reggae One",
    "Revalia",
    "Rhodium Libre",
    "Ribeye",
    "Ribeye Marrow",
    "Righteous",
    "Risque",
    "Road Rage",
    "Roboto",
    "Roboto Condensed",
    "Roboto Flex",
    "Roboto Mono",
    "Roboto Serif",
    "Roboto Slab",
    "Rochester",
    "Rock 3D",
    "Rock Salt",
    "RocknRoll One",
    "Rokkitt",
    "Romanesco",
    "Ropa Sans",
    "Rosario",
    "Rosarivo",
    "Rouge Script",
    "Rowdies",
    "Rozha One",
    "Rubik",
    "Rubik 80s Fade",
    "Rubik Beastly",
    "Rubik Bubbles",
    "Rubik Burned",
    "Rubik Dirt",
    "Rubik Distressed",
    "Rubik Gemstones",
    "Rubik Glitch",
    "Rubik Iso",
    "Rubik Marker Hatch",
    "Rubik Maze",
    "Rubik Microbe",
    "Rubik Mono One",
    "Rubik Moonrocks",
    "Rubik Pixels",
    "Rubik Puddles",
    "Rubik Spray Paint",
    "Rubik Storm",
    "Rubik Vinyl",
    "Rubik Wet Paint",
    "Ruda",
    "Rufina",
    "Ruge Boogie",
    "Ruluko",
    "Rum Raisin",
    "Ruslan Display",
    "Russo One",
    "Ruthie",
    "Ruwudu",
    "Rye",
    "STIX Two Text",
    "Sacramento",
    "Sahitya",
    "Sail",
    "Saira",
    "Saira Condensed",
    "Saira Extra Condensed",
    "Saira Semi Condensed",
    "Saira Stencil One",
    "Salsa",
    "Sanchez",
    "Sancreek",
    "Sansita",
    "Sansita Swashed",
    "Sarabun",
    "Sarala",
    "Sarina",
    "Sarpanch",
    "Sassy Frass",
    "Satisfy",
    "Sawarabi Gothic",
    "Sawarabi Mincho",
    "Scada",
    "Scheherazade New",
    "Schibsted Grotesk",
    "Schoolbell",
    "Scope One",
    "Seaweed Script",
    "Secular One",
    "Sedgwick Ave",
    "Sedgwick Ave Display",
    "Sen",
    "Send Flowers",
    "Sevillana",
    "Seymour One",
    "Shadows Into Light",
    "Shadows Into Light Two",
    "Shalimar",
    "Shantell Sans",
    "Shanti",
    "Share",
    "Share Tech",
    "Share Tech Mono",
    "Shippori Antique",
    "Shippori Antique B1",
    "Shippori Mincho",
    "Shippori Mincho B1",
    "Shizuru",
    "Shojumaru",
    "Short Stack",
    "Shrikhand",
    "Siemreap",
    "Sigmar",
    "Sigmar One",
    "Signika",
    "Signika Negative",
    "Silkscreen",
    "Simonetta",
    "Single Day",
    "Sintony",
    "Sirin Stencil",
    "Six Caps",
    "Skranji",
    "Slabo 13px",
    "Slabo 27px",
    "Slackey",
    "Slackside One",
    "Smokum",
    "Smooch",
    "Smooch Sans",
    "Smythe",
    "Sniglet",
    "Snippet",
    "Snowburst One",
    "Sofadi One",
    "Sofia",
    "Sofia Sans",
    "Sofia Sans Condensed",
    "Sofia Sans Extra Condensed",
    "Sofia Sans Semi Condensed",
    "Solitreo",
    "Solway",
    "Sometype Mono",
    "Song Myung",
    "Sono",
    "Sonsie One",
    "Sora",
    "Sorts Mill Goudy",
    "Source Code Pro",
    "Source Sans 3",
    "Source Serif 4",
    "Space Grotesk",
    "Space Mono",
    "Special Elite",
    "Spectral",
    "Spectral SC",
    "Spicy Rice",
    "Spinnaker",
    "Spirax",
    "Splash",
    "Spline Sans",
    "Spline Sans Mono",
    "Squada One",
    "Square Peg",
    "Sree Krushnadevaraya",
    "Sriracha",
    "Srisakdi",
    "Staatliches",
    "Stalemate",
    "Stalinist One",
    "Stardos Stencil",
    "Stick",
    "Stick No Bills",
    "Stint Ultra Condensed",
    "Stint Ultra Expanded",
    "Stoke",
    "Strait",
    "Style Script",
    "Stylish",
    "Sue Ellen Francisco",
    "Suez One",
    "Sulphur Point",
    "Sumana",
    "Sunflower",
    "Sunshiney",
    "Supermercado One",
    "Sura",
    "Suranna",
    "Suravaram",
    "Suwannaphum",
    "Swanky and Moo Moo",
    "Syncopate",
    "Syne",
    "Syne Mono",
    "Syne Tactile",
    "Tai Heritage Pro",
    "Tajawal",
    "Tangerine",
    "Tapestry",
    "Taprom",
    "Tauri",
    "Taviraj",
    "Teko",
    "Tektur",
    "Telex",
    "Tenali Ramakrishna",
    "Tenor Sans",
    "Text Me One",
    "Texturina",
    "Thasadith",
    "The Girl Next Door",
    "The Nautigal",
    "Tienne",
    "Tillana",
    "Tilt Neon",
    "Tilt Prism",
    "Tilt Warp",
    "Timmana",
    "Tinos",
    "Tiro Bangla",
    "Tiro Devanagari Hindi",
    "Tiro Devanagari Marathi",
    "Tiro Devanagari Sanskrit",
    "Tiro Gurmukhi",
    "Tiro Kannada",
    "Tiro Tamil",
    "Tiro Telugu",
    "Titan One",
    "Titillium Web",
    "Tomorrow",
    "Tourney",
    "Trade Winds",
    "Train One",
    "Trirong",
    "Trispace",
    "Trocchi",
    "Trochut",
    "Truculenta",
    "Trykker",
    "Tsukimi Rounded",
    "Tulpen One",
    "Turret Road",
    "Twinkle Star",
    "Ubuntu",
    "Ubuntu Condensed",
    "Ubuntu Mono",
    "Uchen",
    "Ultra",
    "Unbounded",
    "Uncial Antiqua",
    "Underdog",
    "Unica One",
    "UnifrakturCook",
    "UnifrakturMaguntia",
    "Unkempt",
    "Unlock",
    "Unna",
    "Updock",
    "Urbanist",
    "VT323",
    "Vampiro One",
    "Varela",
    "Varela Round",
    "Varta",
    "Vast Shadow",
    "Vazirmatn",
    "Vesper Libre",
    "Viaoda Libre",
    "Vibes",
    "Vibur",
    "Victor Mono",
    "Vidaloka",
    "Viga",
    "Vina Sans",
    "Voces",
    "Volkhov",
    "Vollkorn",
    "Vollkorn SC",
    "Voltaire",
    "Vujahday Script",
    "Waiting for the Sunrise",
    "Wallpoet",
    "Walter Turncoat",
    "Warnes",
    "Water Brush",
    "Waterfall",
    "Wavefont",
    "Wellfleet",
    "Wendy One",
    "Whisper",
    "WindSong",
    "Wire One",
    "Wix Madefor Display",
    "Wix Madefor Text",
    "Work Sans",
    "Xanh Mono",
    "Yaldevi",
    "Yanone Kaffeesatz",
    "Yantramanav",
    "Yatra One",
    "Yellowtail",
    "Yeon Sung",
    "Yeseva One",
    "Yesteryear",
    "Yomogi",
    "Young Serif",
    "Yrsa",
    "Ysabeau",
    "Ysabeau Infant",
    "Ysabeau Office",
    "Ysabeau SC",
    "Yuji Boku",
    "Yuji Hentaigana Akari",
    "Yuji Hentaigana Akebono",
    "Yuji Mai",
    "Yuji Syuku",
    "Yusei Magic",
    "ZCOOL KuaiLe",
    "ZCOOL QingKe HuangYou",
    "ZCOOL XiaoWei",
    "Zen Antique",
    "Zen Antique Soft",
    "Zen Dots",
    "Zen Kaku Gothic Antique",
    "Zen Kaku Gothic New",
    "Zen Kurenaido",
    "Zen Loop",
    "Zen Maru Gothic",
    "Zen Old Mincho",
    "Zen Tokyo Zoo",
    "Zeyada",
    "Zhi Mang Xing",
    "Zilla Slab",
    "Zilla Slab Highlight"
  ].map((f) => [f.replaceAll(" ", "-").toLowerCase(), f])
);
var styleString = "0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900";
var getFontURL = (font) => {
  return `https://fonts.googleapis.com/css2?${`family=${font.replaceAll(" ", "+")}:ital,wght@${styleString}`}&display=block`;
};
var fontBlacklist = /* @__PURE__ */ new Set([
  "sans",
  "serif",
  "mono",
  "thin",
  "extralight",
  "light",
  "normal",
  "medium",
  "semibold",
  "bold",
  "extrabold",
  "bolder",
  "black"
]);
var extractFonts = (code) => {
  const [fontRegex1, fontRegex2] = [/\bfont-(?:\w*)(?:-\w*)*\b/g, /\bfont\-\[(?:[^\]]+)\]/g];
  const fontsUsed = /* @__PURE__ */ new Set();
  const fontMatches = code.match(fontRegex1) ?? [];
  for (const fontClass of fontMatches) {
    if (!fontBlacklist.has(fontClass)) {
      fontsUsed.add(fontClass.replace("font-", ""));
    }
  }
  const familyMatches = code.match(fontRegex2) ?? [];
  for (const family of familyMatches) {
    const fontName = family.replaceAll("font-[", "").replaceAll("]", "").replaceAll(/['"]/g, "").replaceAll(/_/g, " ");
    if (!fontBlacklist.has(fontName)) {
      fontsUsed.add(fontName.toLowerCase().replaceAll(" ", "-"));
    }
  }
  const fonts = [...fontsUsed].map((f) => GOOGLE_FONTS.get(f) ?? null).filter((f) => f !== null);
  return fonts.sort((a, b) => a.localeCompare(b));
};
var collectedFonts = /* @__PURE__ */ new Set();
var reset = () => {
  collectedFonts.clear();
};
var collectFonts = async () => {
  const files = await fg("src/**/*.{js,ts,jsx,tsx}");
  const allFonts = await Promise.all(
    files.map(async (file) => {
      const code = await fs2.promises.readFile(file, "utf-8");
      return extractFonts(code);
    })
  );
  for (const font of allFonts.flat()) {
    collectedFonts.add(font);
  }
};
function loadFontsFromTailwindSource() {
  return [
    {
      name: "load-fonts-from-tailwind-source",
      enforce: "pre",
      async buildStart() {
        reset();
        await collectFonts();
      },
      transform(code, id) {
        if (!/\.([cm]?[jt]sx)$/.test(id)) {
          return null;
        }
        const fonts = extractFonts(code);
        for (const font of fonts) {
          collectedFonts.add(font);
        }
        return null;
      }
    },
    {
      name: "add-fonts-to-root",
      enforce: "post",
      resolveId(id) {
        if (id === "virtual:load-fonts.jsx") return id;
      },
      load(id) {
        if (id === "virtual:load-fonts.jsx") {
          const code = `
      export function LoadFonts() {
        return (
          <>
            ${[...collectedFonts].map((font) => {
            return `<link rel="stylesheet" href="${getFontURL(font)}" />`;
          }).join("\n")}
          </>
        );
      }
      export default LoadFonts;
    `;
          return code;
        }
      },
      async handleHotUpdate({ file, server, modules }) {
        const fontsBefore = new Set(collectedFonts);
        await collectFonts();
        const fontsAfter = new Set(collectedFonts);
        if (fontsBefore.size === fontsAfter.size && [...fontsBefore].every((f) => fontsAfter.has(f))) {
          return;
        }
        const virtualModuleId = "virtual:load-fonts.jsx";
        const mod = server.moduleGraph.getModuleById(virtualModuleId);
        if (!mod) {
          return;
        }
        server.reloadModule(mod);
      }
    }
  ];
}

// plugins/nextPublicProcessEnv.ts
import { loadEnv } from "file:///home/project/node_modules/vite/dist/node/index.js";
function nextPublicProcessEnv() {
  const publicEnv = loadEnv(
    process.env.NODE_ENV ?? "development",
    process.cwd(),
    "NEXT_PUBLIC_"
  );
  const stub = `
if (typeof window !== 'undefined') {
  const $public = ${JSON.stringify(publicEnv)};
  globalThis.process ??= {};
  // Preserve any env vars set by other libraries
  const base = globalThis.process.env ?? {};
  globalThis.process.env = new Proxy(Object.assign({}, $public, base), {
    get(t, p) { return p in t ? t[p] : undefined; },
    has() { return true; }
  });
}
`;
  return {
    name: "vite:next-public-process-env",
    enforce: "post",
    /** Inject the stub at the top of every JS/TS module compiled for the browser. */
    transform(code, id, opts) {
      if (opts?.ssr) return null;
      if (!/\.[cm]?[jt]sx?$/.test(id)) return null;
      if (code.includes("globalThis.process ??=")) return null;
      return { code: stub + code, map: null };
    }
  };
}

// plugins/restart.ts
import path3 from "node:path";
import process2 from "node:process";
import micromatch from "file:///home/project/node_modules/micromatch/index.js";
var i = 0;
function toArray(arr) {
  if (!arr) return [];
  if (Array.isArray(arr)) return arr;
  return [arr];
}
function restart(options = {}) {
  const { delay = 500, glob: enableGlob = true } = options;
  let root = process2.cwd();
  let reloadGlobs = [];
  let restartGlobs = [];
  let timerState = "reload";
  let timer;
  function clear() {
    globalThis.clearTimeout(timer);
  }
  function schedule(fn) {
    clear();
    timer = globalThis.setTimeout(fn, delay);
  }
  return {
    name: `vite-plugin-restart:${i++}`,
    apply: "serve",
    config(c) {
      if (!enableGlob) return;
      if (!c.server) c.server = {};
      if (!c.server.watch) c.server.watch = {};
    },
    configResolved(config) {
      root = config.root;
      restartGlobs = toArray(options.restart).map(
        (i2) => path3.posix.join(root, i2)
      );
      reloadGlobs = toArray(options.reload).map(
        (i2) => path3.posix.join(root, i2)
      );
    },
    configureServer(server) {
      server.watcher.add([...restartGlobs, ...reloadGlobs]);
      server.watcher.on("add", handleFileChange);
      server.watcher.on("unlink", handleFileChange);
      function handleFileChange(file) {
        if (micromatch.isMatch(file, restartGlobs)) {
          timerState = "restart";
          console.log("File changed, scheduling restart:", file);
          schedule(() => {
            server.restart();
          });
        } else if (micromatch.isMatch(file, reloadGlobs) && timerState !== "restart") {
          timerState = "reload";
          console.log("File changed, scheduling reload:", file);
          schedule(() => {
            server.ws.send({ type: "full-reload" });
            timerState = "";
          });
        }
      }
    }
  };
}

// plugins/restartEnvFileChange.ts
import path4 from "node:path";
import fs3 from "node:fs";
function restartEnvFileChange() {
  return {
    name: "watch-env-and-exit",
    config(config, env) {
      const root = config.root || process.cwd();
      const mode = env.mode || "development";
      const filesToWatch = [
        ".env",
        ".env.local",
        `.env.${mode}`,
        `.env.${mode}.local`
      ].map((f) => path4.resolve(root, f)).filter((file) => fs3.existsSync(file));
      for (const file of filesToWatch) {
        fs3.watch(file, { persistent: false }, () => {
          console.log(`[vite] Detected change in ${path4.basename(file)}. Exiting for restart...`);
          process.exit(0);
        });
      }
    }
  };
}

// vite.config.ts
var __vite_injected_original_dirname3 = "/home/project";
var vite_config_default = defineConfig({
  // Keep them available via import.meta.env.NEXT_PUBLIC_*
  envPrefix: "NEXT_PUBLIC_",
  optimizeDeps: {
    // Explicitly include fast-glob, since it gets dynamically imported and we
    // don't want that to cause a re-bundle.
    include: ["fast-glob", "lucide-react"],
    exclude: [
      "@hono/auth-js/react",
      "@hono/auth-js",
      "@auth/core",
      "@hono/auth-js",
      "hono/context-storage",
      "@auth/core/errors",
      "fsevents",
      "lightningcss"
    ]
  },
  logLevel: "info",
  plugins: [
    nextPublicProcessEnv(),
    restartEnvFileChange(),
    // reactRouterHonoServer removed for static SPA build
    babel2({
      include: ["src/**/*.{js,jsx,ts,tsx}"],
      // or RegExp: /src\/.*\.[tj]sx?$/
      exclude: /node_modules/,
      // skip everything else
      babelConfig: {
        babelrc: false,
        // don’t merge other Babel files
        configFile: false,
        plugins: ["styled-jsx/babel"]
      }
    }),
    restart({
      restart: [
        "src/**/page.jsx",
        "src/**/page.tsx",
        "src/**/layout.jsx",
        "src/**/layout.tsx",
        "src/**/route.js",
        "src/**/route.ts"
      ]
    }),
    consoleToParent(),
    loadFontsFromTailwindSource(),
    addRenderIds(),
    reactRouter(),
    tsconfigPaths(),
    aliases(),
    layoutWrapperPlugin()
  ],
  resolve: {
    alias: {
      lodash: "lodash-es",
      "npm:stripe": "stripe",
      stripe: path5.resolve(__vite_injected_original_dirname3, "./src/__create/stripe"),
      "@auth/create/react": "@hono/auth-js/react",
      "@auth/create": path5.resolve(__vite_injected_original_dirname3, "./src/__create/@auth/create"),
      "@": path5.resolve(__vite_injected_original_dirname3, "src")
    },
    dedupe: ["react", "react-dom"]
  },
  clearScreen: false,
  server: {
    allowedHosts: true,
    host: "0.0.0.0",
    port: 4e3,
    hmr: {
      overlay: false
    },
    warmup: {
      clientFiles: ["./src/app/**/*", "./src/app/root.tsx", "./src/app/routes.ts"]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGx1Z2lucy9hZGRSZW5kZXJJZHMudHMiLCAicGx1Z2lucy9hbGlhc2VzLnRzIiwgInBsdWdpbnMvY29uc29sZS10by1wYXJlbnQudHMiLCAicGx1Z2lucy9sYXlvdXRzLnRzIiwgInBsdWdpbnMvbG9hZEZvbnRzRnJvbVRhaWx3aW5kU291cmNlLnRzIiwgInBsdWdpbnMvbmV4dFB1YmxpY1Byb2Nlc3NFbnYudHMiLCAicGx1Z2lucy9yZXN0YXJ0LnRzIiwgInBsdWdpbnMvcmVzdGFydEVudkZpbGVDaGFuZ2UudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgcmVhY3RSb3V0ZXIgfSBmcm9tICdAcmVhY3Qtcm91dGVyL2Rldi92aXRlJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IGJhYmVsIGZyb20gJ3ZpdGUtcGx1Z2luLWJhYmVsJztcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gJ3ZpdGUtdHNjb25maWctcGF0aHMnO1xuaW1wb3J0IHsgYWRkUmVuZGVySWRzIH0gZnJvbSAnLi9wbHVnaW5zL2FkZFJlbmRlcklkcyc7XG5pbXBvcnQgeyBhbGlhc2VzIH0gZnJvbSAnLi9wbHVnaW5zL2FsaWFzZXMnO1xuaW1wb3J0IGNvbnNvbGVUb1BhcmVudCBmcm9tICcuL3BsdWdpbnMvY29uc29sZS10by1wYXJlbnQnO1xuaW1wb3J0IHsgbGF5b3V0V3JhcHBlclBsdWdpbiB9IGZyb20gJy4vcGx1Z2lucy9sYXlvdXRzJztcbmltcG9ydCB7IGxvYWRGb250c0Zyb21UYWlsd2luZFNvdXJjZSB9IGZyb20gJy4vcGx1Z2lucy9sb2FkRm9udHNGcm9tVGFpbHdpbmRTb3VyY2UnO1xuaW1wb3J0IHsgbmV4dFB1YmxpY1Byb2Nlc3NFbnYgfSBmcm9tICcuL3BsdWdpbnMvbmV4dFB1YmxpY1Byb2Nlc3NFbnYnO1xuaW1wb3J0IHsgcmVzdGFydCB9IGZyb20gJy4vcGx1Z2lucy9yZXN0YXJ0JztcbmltcG9ydCB7IHJlc3RhcnRFbnZGaWxlQ2hhbmdlIH0gZnJvbSAnLi9wbHVnaW5zL3Jlc3RhcnRFbnZGaWxlQ2hhbmdlJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgLy8gS2VlcCB0aGVtIGF2YWlsYWJsZSB2aWEgaW1wb3J0Lm1ldGEuZW52Lk5FWFRfUFVCTElDXypcbiAgZW52UHJlZml4OiAnTkVYVF9QVUJMSUNfJyxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgLy8gRXhwbGljaXRseSBpbmNsdWRlIGZhc3QtZ2xvYiwgc2luY2UgaXQgZ2V0cyBkeW5hbWljYWxseSBpbXBvcnRlZCBhbmQgd2VcbiAgICAvLyBkb24ndCB3YW50IHRoYXQgdG8gY2F1c2UgYSByZS1idW5kbGUuXG4gICAgaW5jbHVkZTogWydmYXN0LWdsb2InLCAnbHVjaWRlLXJlYWN0J10sXG4gICAgZXhjbHVkZTogW1xuICAgICAgJ0Bob25vL2F1dGgtanMvcmVhY3QnLFxuICAgICAgJ0Bob25vL2F1dGgtanMnLFxuICAgICAgJ0BhdXRoL2NvcmUnLFxuICAgICAgJ0Bob25vL2F1dGgtanMnLFxuICAgICAgJ2hvbm8vY29udGV4dC1zdG9yYWdlJyxcbiAgICAgICdAYXV0aC9jb3JlL2Vycm9ycycsXG4gICAgICAnZnNldmVudHMnLFxuICAgICAgJ2xpZ2h0bmluZ2NzcycsXG4gICAgXSxcbiAgfSxcbiAgbG9nTGV2ZWw6ICdpbmZvJyxcbiAgcGx1Z2luczogW1xuICAgIG5leHRQdWJsaWNQcm9jZXNzRW52KCksXG4gICAgcmVzdGFydEVudkZpbGVDaGFuZ2UoKSxcbiAgLy8gcmVhY3RSb3V0ZXJIb25vU2VydmVyIHJlbW92ZWQgZm9yIHN0YXRpYyBTUEEgYnVpbGRcbiAgICBiYWJlbCh7XG4gICAgICBpbmNsdWRlOiBbJ3NyYy8qKi8qLntqcyxqc3gsdHMsdHN4fSddLCAvLyBvciBSZWdFeHA6IC9zcmNcXC8uKlxcLlt0al1zeD8kL1xuICAgICAgZXhjbHVkZTogL25vZGVfbW9kdWxlcy8sIC8vIHNraXAgZXZlcnl0aGluZyBlbHNlXG4gICAgICBiYWJlbENvbmZpZzoge1xuICAgICAgICBiYWJlbHJjOiBmYWxzZSwgLy8gZG9uXHUyMDE5dCBtZXJnZSBvdGhlciBCYWJlbCBmaWxlc1xuICAgICAgICBjb25maWdGaWxlOiBmYWxzZSxcbiAgICAgICAgcGx1Z2luczogWydzdHlsZWQtanN4L2JhYmVsJ10sXG4gICAgICB9LFxuICAgIH0pLFxuICAgIHJlc3RhcnQoe1xuICAgICAgcmVzdGFydDogW1xuICAgICAgICAnc3JjLyoqL3BhZ2UuanN4JyxcbiAgICAgICAgJ3NyYy8qKi9wYWdlLnRzeCcsXG4gICAgICAgICdzcmMvKiovbGF5b3V0LmpzeCcsXG4gICAgICAgICdzcmMvKiovbGF5b3V0LnRzeCcsXG4gICAgICAgICdzcmMvKiovcm91dGUuanMnLFxuICAgICAgICAnc3JjLyoqL3JvdXRlLnRzJyxcbiAgICAgIF0sXG4gICAgfSksXG4gICAgY29uc29sZVRvUGFyZW50KCksXG4gICAgbG9hZEZvbnRzRnJvbVRhaWx3aW5kU291cmNlKCksXG4gICAgYWRkUmVuZGVySWRzKCksXG4gICAgcmVhY3RSb3V0ZXIoKSxcbiAgICB0c2NvbmZpZ1BhdGhzKCksXG4gICAgYWxpYXNlcygpLFxuICAgIGxheW91dFdyYXBwZXJQbHVnaW4oKSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBsb2Rhc2g6ICdsb2Rhc2gtZXMnLFxuICAgICAgJ25wbTpzdHJpcGUnOiAnc3RyaXBlJyxcbiAgICAgIHN0cmlwZTogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL19fY3JlYXRlL3N0cmlwZScpLFxuICAgICAgJ0BhdXRoL2NyZWF0ZS9yZWFjdCc6ICdAaG9uby9hdXRoLWpzL3JlYWN0JyxcbiAgICAgICdAYXV0aC9jcmVhdGUnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvX19jcmVhdGUvQGF1dGgvY3JlYXRlJyksXG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKSxcbiAgICB9LFxuICAgIGRlZHVwZTogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcbiAgfSxcbiAgY2xlYXJTY3JlZW46IGZhbHNlLFxuICBzZXJ2ZXI6IHtcbiAgICBhbGxvd2VkSG9zdHM6IHRydWUsXG4gICAgaG9zdDogJzAuMC4wLjAnLFxuICAgIHBvcnQ6IDQwMDAsXG4gICAgaG1yOiB7XG4gICAgICBvdmVybGF5OiBmYWxzZSxcbiAgICB9LFxuICAgIHdhcm11cDoge1xuICAgICAgY2xpZW50RmlsZXM6IFsnLi9zcmMvYXBwLyoqLyonLCAnLi9zcmMvYXBwL3Jvb3QudHN4JywgJy4vc3JjL2FwcC9yb3V0ZXMudHMnXSxcbiAgICB9LFxuICB9LFxufSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3QvcGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9wbHVnaW5zL2FkZFJlbmRlcklkcy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3BsdWdpbnMvYWRkUmVuZGVySWRzLnRzXCI7aW1wb3J0ICogYXMgYmFiZWwgZnJvbSAnQGJhYmVsL2NvcmUnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5PcHRpb24gfSBmcm9tICd2aXRlJztcbmltcG9ydCB0eXBlIHsgTm9kZVBhdGgsIFBsdWdpbk9iaiB9IGZyb20gJ0BiYWJlbC9jb3JlJztcbmltcG9ydCB0eXBlIHsgSlNYRWxlbWVudCB9IGZyb20gJ0BiYWJlbC90eXBlcyc7XG5pbXBvcnQgdHlwZSAqIGFzIHQgZnJvbSAnQGJhYmVsL3R5cGVzJztcblxuaW1wb3J0IHsgY3JlYXRlSGFzaCB9IGZyb20gJ25vZGU6Y3J5cHRvJztcbmZ1bmN0aW9uIGdlbklkKGZpbGU6IHN0cmluZywgbG9jOiB7IGxpbmU6IG51bWJlcjsgY29sOiBudW1iZXIgfSkge1xuICByZXR1cm4gYHJlbmRlci0ke2NyZWF0ZUhhc2goJ3NoYTEnKVxuICAgIC51cGRhdGUoYCR7ZmlsZX06JHtsb2MubGluZX06JHtsb2MuY29sfWApXG4gICAgLmRpZ2VzdCgnaGV4JylcbiAgICAuc2xpY2UoMCwgOCl9YDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCYWJlbEFQSSB7XG4gIHR5cGVzOiB0eXBlb2YgdDtcbn1cbmNvbnN0IGlkVG9Kc3ggPSB7IGN1cnJlbnQ6IHt9IGFzIFJlY29yZDxzdHJpbmcsIHsgY29kZTogc3RyaW5nIH0+IH07XG5cbmNvbnN0IGdldFJlbmRlcklkVmlzaXRvciA9XG4gICh7IGZpbGVuYW1lIH06IHsgZmlsZW5hbWU6IHN0cmluZyB9KSA9PlxuICAoYXBpOiBCYWJlbEFQSSk6IFBsdWdpbk9iaiA9PiB7XG4gICAgY29uc3QgeyB0eXBlczogdCB9ID0gYXBpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHZpc2l0b3I6IHtcbiAgICAgICAgSlNYRWxlbWVudChwYXRoOiBOb2RlUGF0aDxKU1hFbGVtZW50Pikge1xuICAgICAgICAgIGNvbnN0IG9wZW5pbmcgPSBwYXRoLm5vZGUub3BlbmluZ0VsZW1lbnQ7XG5cbiAgICAgICAgICAvLyBXZSBvbmx5IGNhcmUgYWJvdXQgPHRhZz4gd2hlcmUgdGFnIGlzIGxvd2VyY2FzZSAoSFRNTFx1MDBBMGludHJpbnNpYylcbiAgICAgICAgICBpZiAoIXQuaXNKU1hJZGVudGlmaWVyKG9wZW5pbmcubmFtZSkpIHJldHVybjtcbiAgICAgICAgICBjb25zdCB0YWdOYW1lID0gb3BlbmluZy5uYW1lLm5hbWU7XG4gICAgICAgICAgaWYgKHRhZ05hbWUgIT09IHRhZ05hbWUudG9Mb3dlckNhc2UoKSkgcmV0dXJuOyAvLyBza2lwIGNvbXBvbmVudHNcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICdodG1sJyxcbiAgICAgICAgICAgICAgJ2hlYWQnLFxuICAgICAgICAgICAgICAnYm9keScsXG4gICAgICAgICAgICAgICd0aXRsZScsXG4gICAgICAgICAgICAgICdtZXRhJyxcbiAgICAgICAgICAgICAgJ2xpbmsnLFxuICAgICAgICAgICAgICAnc2NyaXB0JyxcbiAgICAgICAgICAgICAgJ3N0eWxlJyxcbiAgICAgICAgICAgICAgJ25vc2NyaXB0JyxcbiAgICAgICAgICAgICAgJ2Jhc2UnLFxuICAgICAgICAgICAgICAndGVtcGxhdGUnLFxuICAgICAgICAgICAgICAnaWZyYW1lJyxcbiAgICAgICAgICAgICAgJ3N2ZycsXG4gICAgICAgICAgICAgICdtYXRoJyxcbiAgICAgICAgICAgICAgJ3Nsb3QnLFxuICAgICAgICAgICAgICAncGljdHVyZScsXG4gICAgICAgICAgICAgICdzb3VyY2UnLFxuICAgICAgICAgICAgICAnY2FudmFzJyxcbiAgICAgICAgICAgICAgJ3ZpZGVvJyxcbiAgICAgICAgICAgICAgJ2F1ZGlvJyxcbiAgICAgICAgICAgICAgJ29iamVjdCcsXG4gICAgICAgICAgICAgICdlbWJlZCcsXG4gICAgICAgICAgICAgICdwYXJhbScsXG4gICAgICAgICAgICAgICd0cmFjaycsXG4gICAgICAgICAgICBdLmluY2x1ZGVzKHRhZ05hbWUpXG4gICAgICAgICAgKVxuICAgICAgICAgICAgcmV0dXJuOyAvLyBza2lwIGh0bWwgZWxlbWVudHMgdGhhdCBkbyBub3QgcmVuZGVyIHRvIHRoZSBET01cblxuICAgICAgICAgIC8vIElmIGl0IGFscmVhZHkgaGFzIGEgcmVuZGVySWQgcHJvcCwgbGVhdmUgaXQgYWxvbmVcbiAgICAgICAgICBjb25zdCBoYXNSZW5kZXJJZCA9IG9wZW5pbmcuYXR0cmlidXRlcy5zb21lKFxuICAgICAgICAgICAgKGF0dHIpID0+XG4gICAgICAgICAgICAgIHQuaXNKU1hBdHRyaWJ1dGUoYXR0cikgJiZcbiAgICAgICAgICAgICAgdC5pc0pTWElkZW50aWZpZXIoYXR0ci5uYW1lKSAmJlxuICAgICAgICAgICAgICBhdHRyLm5hbWUubmFtZSA9PT0gJ3JlbmRlcklkJ1xuICAgICAgICAgICk7XG4gICAgICAgICAgaWYgKGhhc1JlbmRlcklkKSByZXR1cm47XG4gICAgICAgICAgY29uc3Qgc3RhcnQgPSBwYXRoLm5vZGUubG9jPy5zdGFydCA/PyB7XG4gICAgICAgICAgICBsaW5lOiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDAwKSxcbiAgICAgICAgICAgIGNvbHVtbjogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIGNvbnN0IHJlbmRlcklkID0gZ2VuSWQoZmlsZW5hbWUsIHtcbiAgICAgICAgICAgIGxpbmU6IHN0YXJ0LmxpbmUsXG4gICAgICAgICAgICBjb2w6IHN0YXJ0LmNvbHVtbixcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIEVuc3VyZSBQb2x5bW9ycGhpY0NvbXBvbmVudCBpbXBvcnQgZXhpc3RzIGF0IHRvcFx1MjAxMWxldmVsXG4gICAgICAgICAgY29uc3QgcHJvZ3JhbSA9IHBhdGguZmluZFBhcmVudCgocCkgPT4gcC5pc1Byb2dyYW0oKSk7XG4gICAgICAgICAgaWYgKCFwcm9ncmFtKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgIGBObyBwcm9ncmFtIGZvdW5kIGZvciAke2ZpbGVuYW1lfSBzbyB1bmFibGUgdG8gYWRkIENyZWF0ZVBvbHltb3JwaGljQ29tcG9uZW50IGltcG9ydGBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGlkVG9Kc3guY3VycmVudFtyZW5kZXJJZF0gPSB7IGNvZGU6IHBhdGguZ2V0U291cmNlKCkgfTtcblxuICAgICAgICAgIGNvbnN0IGJvZHkgPSBwcm9ncmFtLmdldCgnYm9keScpO1xuICAgICAgICAgIGNvbnN0IGFscmVhZHlJbXBvcnRlZCA9XG4gICAgICAgICAgICBBcnJheS5pc0FycmF5KGJvZHkpICYmXG4gICAgICAgICAgICBib2R5LnNvbWUoXG4gICAgICAgICAgICAgIChwKSA9PlxuICAgICAgICAgICAgICAgIHQuaXNJbXBvcnREZWNsYXJhdGlvbihwLm5vZGUpICYmXG4gICAgICAgICAgICAgICAgcC5ub2RlLnNvdXJjZS52YWx1ZSA9PT0gJ0AvX19jcmVhdGUvUG9seW1vcnBoaWNDb21wb25lbnQnXG4gICAgICAgICAgICApO1xuICAgICAgICAgIGlmICghYWxyZWFkeUltcG9ydGVkKSB7XG4gICAgICAgICAgICBjb25zdCBpbXBvcnREZWNsID0gdC5pbXBvcnREZWNsYXJhdGlvbihcbiAgICAgICAgICAgICAgW3QuaW1wb3J0RGVmYXVsdFNwZWNpZmllcih0LmlkZW50aWZpZXIoJ0NyZWF0ZVBvbHltb3JwaGljQ29tcG9uZW50JykpXSxcbiAgICAgICAgICAgICAgdC5zdHJpbmdMaXRlcmFsKCdAL19fY3JlYXRlL1BvbHltb3JwaGljQ29tcG9uZW50JylcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCBmaXJzdEltcG9ydCA9IEFycmF5LmlzQXJyYXkoYm9keSlcbiAgICAgICAgICAgICAgPyBib2R5LmZpbmRJbmRleCgocCkgPT4gcC5pc0ltcG9ydERlY2xhcmF0aW9uKCkpXG4gICAgICAgICAgICAgIDogLTE7XG4gICAgICAgICAgICBpZiAoZmlyc3RJbXBvcnQgPT09IC0xKSB7XG4gICAgICAgICAgICAgIHByb2dyYW0udW5zaGlmdENvbnRhaW5lcignYm9keScsIGltcG9ydERlY2wpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgYm9keVtmaXJzdEltcG9ydF0uaW5zZXJ0QmVmb3JlKGltcG9ydERlY2wpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIENsb25lIGV4aXN0aW5nIGF0dHJpYnV0ZXMgYW5kIGFkZCBvdXIgb3duXG4gICAgICAgICAgY29uc3QgbmV3QXR0cmlidXRlcyA9IFtcbiAgICAgICAgICAgIC4uLm9wZW5pbmcuYXR0cmlidXRlcyxcbiAgICAgICAgICAgIHQuanN4QXR0cmlidXRlKHQuanN4SWRlbnRpZmllcigncmVuZGVySWQnKSwgdC5zdHJpbmdMaXRlcmFsKHJlbmRlcklkKSksXG4gICAgICAgICAgICB0LmpzeEF0dHJpYnV0ZSh0LmpzeElkZW50aWZpZXIoJ2FzJyksIHQuc3RyaW5nTGl0ZXJhbCh0YWdOYW1lKSksXG4gICAgICAgICAgXTtcblxuICAgICAgICAgIGNvbnN0IG5ld09wZW5pbmcgPSB0LmpzeE9wZW5pbmdFbGVtZW50KFxuICAgICAgICAgICAgdC5qc3hJZGVudGlmaWVyKCdDcmVhdGVQb2x5bW9ycGhpY0NvbXBvbmVudCcpLFxuICAgICAgICAgICAgbmV3QXR0cmlidXRlcyxcbiAgICAgICAgICAgIG9wZW5pbmcuc2VsZkNsb3NpbmdcbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnN0IG5ld0Nsb3NpbmcgPSBvcGVuaW5nLnNlbGZDbG9zaW5nXG4gICAgICAgICAgICA/IG51bGxcbiAgICAgICAgICAgIDogdC5qc3hDbG9zaW5nRWxlbWVudCh0LmpzeElkZW50aWZpZXIoJ0NyZWF0ZVBvbHltb3JwaGljQ29tcG9uZW50JykpO1xuXG4gICAgICAgICAgY29uc3Qgd3JhcHBlZCA9IHQuanN4RWxlbWVudChcbiAgICAgICAgICAgIG5ld09wZW5pbmcsXG4gICAgICAgICAgICBuZXdDbG9zaW5nLFxuICAgICAgICAgICAgcGF0aC5ub2RlLmNoaWxkcmVuLFxuICAgICAgICAgICAgb3BlbmluZy5zZWxmQ2xvc2luZ1xuICAgICAgICAgICk7XG5cbiAgICAgICAgICBwYXRoLnJlcGxhY2VXaXRoKHdyYXBwZWQpO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9O1xuICB9O1xuXG5leHBvcnQgZnVuY3Rpb24gYWRkUmVuZGVySWRzKCk6IFBsdWdpbk9wdGlvbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2FkZC1yZW5kZXItaWRzJyxcbiAgICBlbmZvcmNlOiAncHJlJyxcbiAgICBhc3luYyB0cmFuc2Zvcm0oY29kZSwgaWQpIHtcbiAgICAgIC8vIG5lZWQgYWxsIG1vZHVsZSBmaWxlcyBBTkQgdGhlIG5vTGF5b3V0IHF1ZXJ5IChsYXlvdXQgd3JhcHBlciBwbHVnaW4pXG4gICAgICBpZiAoIS9cXC4oW2NtXT9banRdc3gpKFxcP25vTGF5b3V0KT8kLy50ZXN0KGlkKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICghaWQuaW5jbHVkZXMoJ2FwcHMvd2ViL3NyYy8nKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYmFiZWwudHJhbnNmb3JtQXN5bmMoY29kZSwge1xuICAgICAgICBmaWxlbmFtZTogaWQsXG4gICAgICAgIHNvdXJjZU1hcHM6IHRydWUsXG4gICAgICAgIGJhYmVscmM6IGZhbHNlLFxuICAgICAgICBjb25maWdGaWxlOiBmYWxzZSxcbiAgICAgICAgcHJlc2V0czogW1snQGJhYmVsL3ByZXNldC1yZWFjdCcsIHsgcnVudGltZTogJ2F1dG9tYXRpYycgfV0sICdAYmFiZWwvcHJlc2V0LXR5cGVzY3JpcHQnXSxcbiAgICAgICAgcGx1Z2luczogW2dldFJlbmRlcklkVmlzaXRvcih7IGZpbGVuYW1lOiBpZCB9KV0sXG4gICAgICB9KTtcblxuICAgICAgaWYgKCFyZXN1bHQpIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIHsgY29kZTogcmVzdWx0LmNvZGUgPz8gY29kZSwgbWFwOiByZXN1bHQubWFwIH07XG4gICAgfSxcblxuICAgIGFwaToge1xuICAgICAgZ2V0UmVuZGVySWRNYXAoKSB7XG4gICAgICAgIHJldHVybiBpZFRvSnN4LmN1cnJlbnQ7XG4gICAgICB9LFxuICAgIH0sXG4gIH07XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3QvcGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9wbHVnaW5zL2FsaWFzZXMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9wbHVnaW5zL2FsaWFzZXMudHNcIjtpbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tICdub2RlOmZzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGFsaWFzZXMoKTogUGx1Z2luIHtcbiAgcmV0dXJuIHtcbiAgICBlbmZvcmNlOiAncHJlJywgLy8gcnVuIGFzIGVhcmx5IGFzIHBvc3NpYmxlXG4gICAgbmFtZTogJ2FwaS1hd2FyZS1hbGlhcycsXG4gICAgcmVzb2x2ZUlkKHNvdXJjZTogc3RyaW5nLCBpbXBvcnRlcj86IHN0cmluZykge1xuICAgICAgaWYgKCFzb3VyY2Uuc3RhcnRzV2l0aCgnQC8nKSkgcmV0dXJuO1xuICAgICAgY29uc3Qgc291cmNlUGF0aCA9IHNvdXJjZS5zbGljZSgnQC8nLmxlbmd0aCk7XG4gICAgICBjb25zdCBleHRlbnNpb25zID0gWycudHMnLCAnLmpzJywgJy50c3gnLCAnLmpzeCddO1xuXG4gICAgICBmb3IgKGNvbnN0IGV4dCBvZiBleHRlbnNpb25zKSB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLycsICdzcmMnLCBgLi8ke3NvdXJjZVBhdGh9JHtleHR9YCk7XG5cbiAgICAgICAgaWYgKGV4aXN0c1N5bmMoZmlsZVBhdGgpKSB7XG4gICAgICAgICAgcmV0dXJuIGZpbGVQYXRoO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfSxcbiAgfTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9wbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3BsdWdpbnMvY29uc29sZS10by1wYXJlbnQudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9wbHVnaW5zL2NvbnNvbGUtdG8tcGFyZW50LnRzXCI7aW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcblxuLyoqXG4gKiBBIFZpdGUgcGx1Z2luIHRoYXQgaW5qZWN0cyBhIHNlbGYtZXhlY3V0aW5nIGJ1bmRsZSBpbnRvIGV2ZXJ5IG1vZHVsZVxuICogdG8gZm9yd2FyZCBjb25zb2xlIG1lc3NhZ2VzIHRvIHRoZSBwYXJlbnQgd2luZG93LlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb25zb2xlVG9QYXJlbnQoKTogUGx1Z2luIHtcbiAgY29uc3QgdmlydElkID0gJ1xcMHZpcnR1YWw6Y29uc29sZS10by1wYXJlbnQnO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3ZpdGUtY29uc29sZS10by1wYXJlbnQnLFxuICAgIGFwcGx5OiAnc2VydmUnLFxuICAgIHJlc29sdmVJZChpZCkge1xuICAgICAgaWYgKGlkID09PSB2aXJ0SWQpIHJldHVybiBpZDtcbiAgICB9LFxuICAgIGxvYWQoaWQpIHtcbiAgICAgIGlmIChpZCAhPT0gdmlydElkKSByZXR1cm47XG5cbiAgICAgIHJldHVybiBgXG4oZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcbiAgaWYgKCF3aW5kb3cgfHwgd2luZG93LnBhcmVudCA9PT0gd2luZG93KSByZXR1cm47XG5cbiAgY29uc3QgYWxsb3cgPSAnKic7XG4gIGNvbnN0IGFsbG93ZWQgPSAob3JpZ2luKSA9PlxuICAgIGFsbG93ID09PSAnKicgfHxcbiAgICAoQXJyYXkuaXNBcnJheShhbGxvdykgPyBhbGxvdy5pbmNsdWRlcyhvcmlnaW4pIDogYWxsb3cgPT09IG9yaWdpbik7XG5cbiAgZnVuY3Rpb24gc2FmZVN0cmluZ2lmeSh2YWx1ZSkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSwgKF9rLCB2KSA9PiB7XG4gICAgICBpZiAodiBpbnN0YW5jZW9mIERhdGUpIHJldHVybiB7IF9fdDogJ0RhdGUnLCB2OiB2LnRvSVNPU3RyaW5nKCkgfTtcbiAgICAgIGlmICh2IGluc3RhbmNlb2YgRXJyb3IpXG4gICAgICAgIHJldHVybiB7IF9fdDogJ0Vycm9yJywgdjogeyBuYW1lOiB2Lm5hbWUsIG1lc3NhZ2U6IHYubWVzc2FnZSwgc3RhY2s6IHYuc3RhY2sgfSB9O1xuICAgICAgcmV0dXJuIHY7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXQoYXJncykge1xuICAgIGlmICghYXJncy5sZW5ndGgpIHJldHVybiAnJztcbiAgICBjb25zdCBmaXJzdCA9IGFyZ3NbMF07XG4gICAgaWYgKHR5cGVvZiBmaXJzdCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBhcmdzLm1hcChTdHJpbmcpLmpvaW4oJyAnKTtcbiAgICB9XG4gICAgbGV0IGluZGV4ID0gMTtcbiAgICBjb25zdCBvdXQgPSBmaXJzdC5yZXBsYWNlKC8lW3NkaWZqb09jJV0vZywgKG0pID0+IHtcbiAgICAgIGlmIChtID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgICAgaWYgKG0gPT09ICclYycpIHsgaW5kZXgrKzsgcmV0dXJuICcnOyB9IC8vIHN3YWxsb3cgQ1NTIHN0eWxlc1xuICAgICAgaWYgKGluZGV4ID49IGFyZ3MubGVuZ3RoKSByZXR1cm4gbTtcbiAgICAgIGNvbnN0IHZhbCA9IGFyZ3NbaW5kZXgrK107XG4gICAgICBzd2l0Y2ggKG0pIHtcbiAgICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKHZhbCk7XG4gICAgICAgIGNhc2UgJyVkJzpcbiAgICAgICAgY2FzZSAnJWknOiByZXR1cm4gcGFyc2VJbnQodmFsLCAxMCk7XG4gICAgICAgIGNhc2UgJyVmJzogcmV0dXJuIHBhcnNlRmxvYXQodmFsKTtcbiAgICAgICAgY2FzZSAnJWonOiB0cnkgeyByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsKTsgfSBjYXRjaCB7IHJldHVybiAnW0NpcmN1bGFyXSc7IH1cbiAgICAgICAgY2FzZSAnJW8nOlxuICAgICAgICBjYXNlICclTyc6IHRyeSB7IHJldHVybiBTdHJpbmcodmFsKTsgfSBjYXRjaCB7IHJldHVybiAnW09iamVjdF0nOyB9XG4gICAgICAgIGRlZmF1bHQ6IHJldHVybiBtO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnN0IHJlc3QgPSBhcmdzLnNsaWNlKGluZGV4KS5tYXAoU3RyaW5nKS5qb2luKCcgJyk7XG4gICAgcmV0dXJuIHJlc3QgPyBvdXQgKyAnICcgKyByZXN0IDogb3V0O1xuICB9XG5cbiAgWydsb2cnLCAnaW5mbycsICd3YXJuJywgJ2Vycm9yJywgJ2RlYnVnJywgJ3RhYmxlJywgJ3RyYWNlJ10uZm9yRWFjaCgobGV2ZWwpID0+IHtcbiAgICBjb25zdCBvcmlnaW5hbCA9IGNvbnNvbGVbbGV2ZWxdPy5iaW5kKGNvbnNvbGUpO1xuICAgIGNvbnNvbGVbbGV2ZWxdID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSB7XG4gICAgICAgICAgdHlwZTogJ3NhbmRib3g6d2ViOmNvbnNvbGUtd3JpdGUnLFxuICAgICAgICAgIF9fdml0ZUNvbnNvbGU6IHRydWUsXG4gICAgICAgICAgbGV2ZWwsXG4gICAgICAgICAgdGV4dDogZm9ybWF0KGFyZ3MpLFxuICAgICAgICAgIGFyZ3M6IGFyZ3MubWFwKHNhZmVTdHJpbmdpZnkpLFxuICAgICAgICB9O1xuICAgICAgICB3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKG1lc3NhZ2UsICcqJyk7XG4gICAgICB9IGNhdGNoIChfKSB7fVxuICAgICAgb3JpZ2luYWw/LiguLi5hcmdzKTtcbiAgICB9O1xuICB9KTtcbn0pKCk7XG4gICAgICBgO1xuICAgIH0sXG4gICAgdHJhbnNmb3JtKGNvZGUsIGlkKSB7XG4gICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSByZXR1cm47XG4gICAgICBpZiAoIWlkLmluY2x1ZGVzKCcvYXBwcy93ZWIvc3JjLycpKSByZXR1cm47XG4gICAgICBpZiAoIS9cXC4oanN8dHN8anN4fHRzeCkkLy50ZXN0KGlkKSkgcmV0dXJuO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29kZTogYGltcG9ydCAnJHt2aXJ0SWR9JztcXG4ke2NvZGV9YCxcbiAgICAgICAgbWFwOiBudWxsLFxuICAgICAgfTtcbiAgICB9LFxuICB9O1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3BsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3QvcGx1Z2lucy9sYXlvdXRzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3QvcGx1Z2lucy9sYXlvdXRzLnRzXCI7Ly8gdml0ZS1yZWFjdC1oaWVyYXJjaGljYWwtbGF5b3V0cy50c1xuaW1wb3J0IGZzIGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB0eXBlIHsgUGx1Z2luQ29udGV4dCB9IGZyb20gJ3JvbGx1cCc7XG5pbXBvcnQgeyBub3JtYWxpemVQYXRoLCB0cmFuc2Zvcm1XaXRoRXNidWlsZCwgdHlwZSBQbHVnaW4gfSBmcm9tICd2aXRlJztcblxuZXhwb3J0IGludGVyZmFjZSBIaWVyYXJjaGljYWxMYXlvdXRPcHRpb25zIHtcbiAgLyoqXG4gICAqIFJlZ0V4cCB0aGF0IGlkZW50aWZpZXMgYSBcdTIwMUNwYWdlXHUyMDFEIGZpbGUuXG4gICAqIERlZmF1bHQ6ICAgL1xcL3BhZ2VcXC4oanN4P3x0c3g/KSQvXG4gICAqL1xuICBwYWdlUGF0dGVybj86IFJlZ0V4cDtcbiAgLyoqXG4gICAqIEZpbGUgbmFtZXMgdG8gbG9vayBmb3Igd2hlbiBzZWFyY2hpbmcgZm9yIGEgbGF5b3V0IGluIGVhY2ggZGlyZWN0b3J5LlxuICAgKiBUaGUgZmlyc3QgbWF0Y2ggd2lucy4gRGVmYXVsdDogWydsYXlvdXQuanN4JywgJ2xheW91dC50c3gnXVxuICAgKi9cbiAgbGF5b3V0RmlsZXM/OiBzdHJpbmdbXTtcbiAgLyoqXG4gICAqIEFic29sdXRlIHBhdGhzIHRoYXQgYWN0IGFzIFx1MjAxQ3Jvb3RzXHUyMDFELlxuICAgKiBUaGUgdXB3YXJkIHdhbGsgc3RvcHMgb25jZSB3ZSByZWFjaCBhbnkgb2YgdGhlc2UuXG4gICAqIERlZmF1bHQ6IHRoZSBWaXRlIHByb2plY3Qgcm9vdCAoYGNvbmZpZy5yb290YClcbiAgICovXG4gIHNyY1Jvb3RzPzogc3RyaW5nW107XG59XG5cbmNvbnN0IERFRkFVTFRfUEFHRV9QQVRURVJOID0gL1xcL3BhZ2VcXC4oanN4PykkLztcbmNvbnN0IERFRkFVTFRfTEFZT1VUX0ZJTEVTID0gWydsYXlvdXQuanN4J107XG5jb25zdCBERUZBVUxUX1BBUkFNX1BBVFRFUk4gPSAvXFxbKFxcLnszfSk/KFteXFxdXSspXFxdL2c7XG5jb25zdCBOT19MQVlPVVRfUVVFUlkgPSAnP25vTGF5b3V0LmpzeCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBsYXlvdXRXcmFwcGVyUGx1Z2luKHVzZXJPcHRzOiBIaWVyYXJjaGljYWxMYXlvdXRPcHRpb25zID0ge30pOiBQbHVnaW4ge1xuICBjb25zdCBvcHRzOiBSZXF1aXJlZDxIaWVyYXJjaGljYWxMYXlvdXRPcHRpb25zPiA9IHtcbiAgICBwYWdlUGF0dGVybjogdXNlck9wdHMucGFnZVBhdHRlcm4gPz8gREVGQVVMVF9QQUdFX1BBVFRFUk4sXG4gICAgbGF5b3V0RmlsZXM6IHVzZXJPcHRzLmxheW91dEZpbGVzID8/IERFRkFVTFRfTEFZT1VUX0ZJTEVTLFxuICAgIHNyY1Jvb3RzOiB1c2VyT3B0cy5zcmNSb290cyA/PyBbcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3NyYycpXSxcbiAgfTtcblxuICBsZXQgcm9vdCA9ICcnO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3ZpdGUtcmVhY3QtaGllcmFyY2hpY2FsLWxheW91dHMnLFxuICAgIGVuZm9yY2U6ICdwcmUnLFxuXG4gICAgY29uZmlnUmVzb2x2ZWQoYykge1xuICAgICAgcm9vdCA9IG5vcm1hbGl6ZVBhdGgoYy5yb290KTtcbiAgICB9LFxuXG4gICAgLyogXHUyMDE0XHUyMDE0XHUyMDE0IHR1cm4gYW55ICAgc3JjL2Zvby9iYXIvcGFnZS50c3ggICBpbnRvIGEgd3JhcHBlciBcdTIwMTRcdTIwMTRcdTIwMTQgKi9cbiAgICBhc3luYyB0cmFuc2Zvcm0oY29kZSwgaWQpIHtcbiAgICAgIGlmIChcbiAgICAgICAgb3B0cy5wYWdlUGF0dGVybi50ZXN0KGlkKSAmJlxuICAgICAgICAhaWQuaW5jbHVkZXMoTk9fTEFZT1VUX1FVRVJZKSAvLyBhdm9pZCB3cmFwcGluZyB0aGUgYWxyZWFkeSB3cmFwcGVkIHBhZ2VcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gYnVpbGRXcmFwcGVyLmNhbGwodGhpcywgaWQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgfTtcblxuICAvKipcbiAgICogV2FsayBmcm9tIGBwYWdlUGF0aGAgdXB3YXJkLCBjb2xsZWN0aW5nIGVhY2ggZGlyZWN0b3J5XHUyMDE5cyBmaXJzdCBtYXRjaGluZyBsYXlvdXQgZmlsZS5cbiAgICogUmV0dXJuZWQgb3JkZXI6IG91dGVybW9zdCBcdTIxOTIgaW5uZXJtb3N0IChyb290XHUyMDExZmlyc3QpLlxuICAgKi9cbiAgZnVuY3Rpb24gY29sbGVjdExheW91dHMocGFnZVBhdGg6IHN0cmluZywgbzogUmVxdWlyZWQ8SGllcmFyY2hpY2FsTGF5b3V0T3B0aW9ucz4pIHtcbiAgICBjb25zdCBsYXlvdXRzOiB7IGFic0ZpbGU6IHN0cmluZzsgaGFzRXhwb3J0OiBib29sZWFuIH1bXSA9IFtdO1xuICAgIGxldCBkaXIgPSBwYXRoLmRpcm5hbWUocGFnZVBhdGgpO1xuXG4gICAgY29uc3Qgc3RvcERpcnMgPSBvLnNyY1Jvb3RzLm1hcCgocikgPT4gcGF0aC5yZXNvbHZlKHIpKTtcblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBmb3IgKGNvbnN0IG5hbWUgb2Ygby5sYXlvdXRGaWxlcykge1xuICAgICAgICBjb25zdCBjYW5kaWRhdGUgPSBwYXRoLmpvaW4oZGlyLCBuYW1lKTtcbiAgICAgICAgLy8gdGhpcyBlbnN1cmVzIHdlIGRvbid0IHRyeSB0byBpbmNsdWRlIGxheW91dHMgdGhhdCBkb24ndCBleHBvcnQgYW55dGhpbmdcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoY2FuZGlkYXRlKSAmJiBmcy5zdGF0U3luYyhjYW5kaWRhdGUpLmlzRmlsZSgpKSB7XG4gICAgICAgICAgY29uc3QgaGFzRXhwb3J0ID0gZnMucmVhZEZpbGVTeW5jKGNhbmRpZGF0ZSwgJ3V0Zi04JykuaW5jbHVkZXMoJ2V4cG9ydCcpO1xuICAgICAgICAgIGxheW91dHMudW5zaGlmdCh7IGFic0ZpbGU6IGNhbmRpZGF0ZSwgaGFzRXhwb3J0IH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc3RvcERpcnMuaW5jbHVkZXMoZGlyKSkgYnJlYWs7XG4gICAgICBjb25zdCBwYXJlbnQgPSBwYXRoLmRpcm5hbWUoZGlyKTtcbiAgICAgIGlmIChwYXJlbnQgPT09IGRpcikgYnJlYWs7IC8vIHJlYWNoZWQgZmlsZXN5c3RlbSByb290XG4gICAgICBkaXIgPSBwYXJlbnQ7XG4gICAgfVxuICAgIHJldHVybiBsYXlvdXRzO1xuICB9XG4gIC8qKlxuICAgKiBFeHRyYWN0IHJvdXRlIHBhcmFtZXRlcnMgZnJvbSBhIGZpbGUgcGF0aC5cbiAgICogRm9yIGV4YW1wbGUsIGZyb20gJy91c2Vycy9baWRdL3Bvc3RzL1twb3N0SWRdL3BhZ2UudHN4JyBpdCBleHRyYWN0cyBbJ2lkJywgJ3Bvc3RJZCddXG4gICAqIEFsc28gaGFuZGxlcyBzcHJlYWQgcGFyYW1ldGVycyBsaWtlICcvZmlsZXMvWy4uLnBhdGhdL3BhZ2UudHN4JyAtPiBbJ3BhdGgnXVxuICAgKi9cbiAgZnVuY3Rpb24gZXh0cmFjdFJvdXRlUGFyYW1zKHBhZ2VQYXRoOiBzdHJpbmcsIHBhcmFtUGF0dGVybjogUmVnRXhwKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IG5vcm1hbGl6ZVBhdGgocGFnZVBhdGgpO1xuICAgIGNvbnN0IHBhcmFtczogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBtYXRjaGVzID0gcmVsYXRpdmVQYXRoLm1hdGNoQWxsKG5ldyBSZWdFeHAocGFyYW1QYXR0ZXJuKSk7XG5cbiAgICBmb3IgKGNvbnN0IG1hdGNoIG9mIG1hdGNoZXMpIHtcbiAgICAgIC8vIG1hdGNoWzFdIHdpbGwgYmUgXCIuLi5cIiBpZiBpdCdzIGEgc3ByZWFkIHBhcmFtZXRlciwgb3RoZXJ3aXNlIHVuZGVmaW5lZFxuICAgICAgLy8gbWF0Y2hbMl0gd2lsbCBiZSB0aGUgcGFyYW1ldGVyIG5hbWVcbiAgICAgIGlmIChtYXRjaFsyXSkge1xuICAgICAgICBwYXJhbXMucHVzaChtYXRjaFsyXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcmFtcztcbiAgfVxuICAvKipcbiAgICogQnVpbGQgdGhlIHdyYXBwZXIgbW9kdWxlIHRoYXQgbmVzdHMgdGhlIHJvdXRlIHBhZ2UgaW5zaWRlIGFueSBtYXRjaGluZ1xuICAgKiBsYXlvdXRzLiBDYWxsIHRoaXMgZnJvbSB0aGUgYHRyYW5zZm9ybWAgaG9vayBhbmQgcmV0dXJuIGl0cyBvdXRwdXQgZGlyZWN0bHkuXG4gICAqL1xuICBmdW5jdGlvbiBidWlsZFdyYXBwZXIodGhpczogUGx1Z2luQ29udGV4dCwgcGFnZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgbGF5b3V0cyA9IGNvbGxlY3RMYXlvdXRzKHBhZ2VQYXRoLCBvcHRzKTtcblxuICAgIC8vIFRlbGwgVml0ZSB0byB3YXRjaCB0aGVzZSBsYXlvdXQgZmlsZXMgZm9yIGNoYW5nZXNcbiAgICBmb3IgKGNvbnN0IGxheW91dCBvZiBsYXlvdXRzKSB7XG4gICAgICB0aGlzLmFkZFdhdGNoRmlsZShsYXlvdXQuYWJzRmlsZSk7XG4gICAgfVxuXG4gICAgLy8gcm91dGUgcGFyYW1zIGxpa2UgW2lkXSBvciBbLi4uc2x1Z11cbiAgICBjb25zdCByb3V0ZVBhcmFtcyA9IGV4dHJhY3RSb3V0ZVBhcmFtcyhwYWdlUGF0aCwgREVGQVVMVF9QQVJBTV9QQVRURVJOKTtcbiAgICBjb25zdCBoYXNTcHJlYWRQYXJhbXMgPSAvXFxbXFwuezN9W15cXF1dK1xcXS8udGVzdChub3JtYWxpemVQYXRoKHBhZ2VQYXRoKSk7XG5cbiAgICAvKiAtLS0tLS0tLS0tIGltcG9ydHMgLS0tLS0tLS0tLSAqL1xuICAgIGNvbnN0IGltcG9ydHM6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3Qgb3BlbmluZzogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBjbG9zaW5nOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgbGF5b3V0cy5mb3JFYWNoKCh7IGFic0ZpbGUsIGhhc0V4cG9ydCB9LCBpKSA9PiB7XG4gICAgICBjb25zdCB2YXJOYW1lID0gYExheW91dCR7aX1gO1xuICAgICAgaW1wb3J0cy5wdXNoKGBpbXBvcnQgJHt2YXJOYW1lfSBmcm9tICR7SlNPTi5zdHJpbmdpZnkoYWJzRmlsZSl9O2ApO1xuICAgICAgaWYgKGhhc0V4cG9ydCkge1xuICAgICAgICBvcGVuaW5nLnB1c2goYDwke3Zhck5hbWV9PmApO1xuICAgICAgICBjbG9zaW5nLnVuc2hpZnQoYDwvJHt2YXJOYW1lfT5gKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGltcG9ydCB0aGUgYWN0dWFsIHBhZ2Ugd2l0aCBhIGZsYWcgdG8gc2tpcCByZS13cmFwcGluZ1xuICAgIGltcG9ydHMucHVzaChgaW1wb3J0IFBhZ2UgZnJvbSAke0pTT04uc3RyaW5naWZ5KHBhZ2VQYXRoICsgTk9fTEFZT1VUX1FVRVJZKX07YCk7XG5cbiAgICBpZiAocm91dGVQYXJhbXMubGVuZ3RoID4gMCkge1xuICAgICAgaW1wb3J0cy5wdXNoKFxuICAgICAgICBgaW1wb3J0IHsgdXNlUGFyYW1zJHtoYXNTcHJlYWRQYXJhbXMgPyAnLCB1c2VMb2NhdGlvbicgOiAnJ30gfSBmcm9tICdyZWFjdC1yb3V0ZXItZG9tJztgXG4gICAgICApO1xuICAgIH1cblxuICAgIC8qIC0tLS0tLS0tLS0gbW9kdWxlIGJvZHkgLS0tLS0tLS0tLSAqL1xuICAgIHJldHVybiBgXG4ke2ltcG9ydHMuam9pbignXFxuJyl9XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFdyYXBwZWRQYWdlKHByb3BzKSB7XG4gICR7cm91dGVQYXJhbXMubGVuZ3RoID4gMCA/ICdjb25zdCBwYXJhbXMgPSB1c2VQYXJhbXMoKTsnIDogJyd9XG4gICR7aGFzU3ByZWFkUGFyYW1zID8gJ2NvbnN0IGxvY2F0aW9uID0gdXNlTG9jYXRpb24oKTsnIDogJyd9XG4gIHJldHVybiAoXG4gICAgJHtvcGVuaW5nLmpvaW4oJ1xcbiAgICAnKX1cbiAgICAgIDxQYWdlIHsuLi5wcm9wc30ke1xuICAgICAgICByb3V0ZVBhcmFtcy5sZW5ndGggPiAwXG4gICAgICAgICAgPyByb3V0ZVBhcmFtc1xuICAgICAgICAgICAgICAubWFwKChwYXJhbSkgPT5cbiAgICAgICAgICAgICAgICBwYWdlUGF0aC5pbmNsdWRlcyhgWy4uLiR7cGFyYW19XWApXG4gICAgICAgICAgICAgICAgICA/IC8vIGNvbGxlY3QgdGhlIHJlc3Qgb2YgdGhlIHBhdGggZm9yIHNwcmVhZCBwYXJhbXNcbiAgICAgICAgICAgICAgICAgICAgYCR7cGFyYW19PXtsb2NhdGlvbi5wYXRobmFtZVxuICAgICAgICAgICAgICAgICAgICAgIC5zcGxpdCgnLycpXG4gICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24ucGF0aG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLnNwbGl0KCcvJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmRJbmRleChCb29sZWFuKSArIDFcbiAgICAgICAgICAgICAgICAgICAgICApfWBcbiAgICAgICAgICAgICAgICAgIDogYCR7cGFyYW19PXtwYXJhbXMuJHtwYXJhbX19YFxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIC5qb2luKCcgJylcbiAgICAgICAgICA6ICcnXG4gICAgICB9IC8+XG4gICAgJHtjbG9zaW5nLmpvaW4oJ1xcbiAgICAnKX1cbiAgKTtcbn1cbmA7XG4gIH1cbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9wbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3BsdWdpbnMvbG9hZEZvbnRzRnJvbVRhaWx3aW5kU291cmNlLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3QvcGx1Z2lucy9sb2FkRm9udHNGcm9tVGFpbHdpbmRTb3VyY2UudHNcIjtpbXBvcnQgeyBrZWJhYkNhc2UsIHN0YXJ0Q2FzZSwgdG9Mb3dlciB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgdHlwZSB7IEh0bWxUYWdEZXNjcmlwdG9yLCBQbHVnaW5PcHRpb24gfSBmcm9tICd2aXRlJztcbmltcG9ydCBmcyBmcm9tICdub2RlOmZzJztcbmltcG9ydCBmZyBmcm9tICdmYXN0LWdsb2InO1xuXG5jb25zdCBHT09HTEVfRk9OVFMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPihcbiAgW1xuICAgICdBQmVlWmVlJyxcbiAgICAnQURMYU0gRGlzcGxheScsXG4gICAgJ0FSIE9uZSBTYW5zJyxcbiAgICAnQWJlbCcsXG4gICAgJ0FiaGF5YSBMaWJyZScsXG4gICAgJ0Fib3JldG8nLFxuICAgICdBYnJpbCBGYXRmYWNlJyxcbiAgICAnQWJ5c3NpbmljYSBTSUwnLFxuICAgICdBY2xvbmljYScsXG4gICAgJ0FjbWUnLFxuICAgICdBY3RvcicsXG4gICAgJ0FkYW1pbmEnLFxuICAgICdBZHZlbnQgUHJvJyxcbiAgICAnQWdiYWx1bW8nLFxuICAgICdBZ2Rhc2ltYScsXG4gICAgJ0FndWFmaW5hIFNjcmlwdCcsXG4gICAgJ0FrYXRhYicsXG4gICAgJ0FrYXlhIEthbmFkYWthJyxcbiAgICAnQWtheWEgVGVsaXZpZ2FsYScsXG4gICAgJ0Frcm9uaW0nLFxuICAgICdBa3NoYXInLFxuICAgICdBbGFkaW4nLFxuICAgICdBbGF0YScsXG4gICAgJ0FsYXRzaScsXG4gICAgJ0FsYmVydCBTYW5zJyxcbiAgICAnQWxkcmljaCcsXG4gICAgJ0FsZWYnLFxuICAgICdBbGVncmV5YScsXG4gICAgJ0FsZWdyZXlhIFNDJyxcbiAgICAnQWxlZ3JleWEgU2FucycsXG4gICAgJ0FsZWdyZXlhIFNhbnMgU0MnLFxuICAgICdBbGVvJyxcbiAgICAnQWxleCBCcnVzaCcsXG4gICAgJ0FsZXhhbmRyaWEnLFxuICAgICdBbGZhIFNsYWIgT25lJyxcbiAgICAnQWxpY2UnLFxuICAgICdBbGlrZScsXG4gICAgJ0FsaWtlIEFuZ3VsYXInLFxuICAgICdBbGthbGFtaScsXG4gICAgJ0Fsa2F0cmEnLFxuICAgICdBbGxhbicsXG4gICAgJ0FsbGVydGEnLFxuICAgICdBbGxlcnRhIFN0ZW5jaWwnLFxuICAgICdBbGxpc29uJyxcbiAgICAnQWxsdXJhJyxcbiAgICAnQWxtYXJhaScsXG4gICAgJ0FsbWVuZHJhJyxcbiAgICAnQWxtZW5kcmEgRGlzcGxheScsXG4gICAgJ0FsbWVuZHJhIFNDJyxcbiAgICAnQWx1bW5pIFNhbnMnLFxuICAgICdBbHVtbmkgU2FucyBDb2xsZWdpYXRlIE9uZScsXG4gICAgJ0FsdW1uaSBTYW5zIElubGluZSBPbmUnLFxuICAgICdBbHVtbmkgU2FucyBQaW5zdHJpcGUnLFxuICAgICdBbWFyYW50ZScsXG4gICAgJ0FtYXJhbnRoJyxcbiAgICAnQW1hdGljIFNDJyxcbiAgICAnQW1ldGh5c3RhJyxcbiAgICAnQW1pa28nLFxuICAgICdBbWlyaScsXG4gICAgJ0FtaXJpIFF1cmFuJyxcbiAgICAnQW1pdGEnLFxuICAgICdBbmFoZWltJyxcbiAgICAnQW5kYWRhIFBybycsXG4gICAgJ0FuZGlrYScsXG4gICAgJ0FuZWsgQmFuZ2xhJyxcbiAgICAnQW5layBEZXZhbmFnYXJpJyxcbiAgICAnQW5layBHdWphcmF0aScsXG4gICAgJ0FuZWsgR3VybXVraGknLFxuICAgICdBbmVrIEthbm5hZGEnLFxuICAgICdBbmVrIExhdGluJyxcbiAgICAnQW5layBNYWxheWFsYW0nLFxuICAgICdBbmVrIE9kaWEnLFxuICAgICdBbmVrIFRhbWlsJyxcbiAgICAnQW5layBUZWx1Z3UnLFxuICAgICdBbmdrb3InLFxuICAgICdBbm5pZSBVc2UgWW91ciBUZWxlc2NvcGUnLFxuICAgICdBbm9ueW1vdXMgUHJvJyxcbiAgICAnQW50aWMnLFxuICAgICdBbnRpYyBEaWRvbmUnLFxuICAgICdBbnRpYyBTbGFiJyxcbiAgICAnQW50b24nLFxuICAgICdBbnRvbmlvJyxcbiAgICAnQW51cGhhbicsXG4gICAgJ0FueWJvZHknLFxuICAgICdBb2Jvc2hpIE9uZScsXG4gICAgJ0FyYXBleScsXG4gICAgJ0FyYnV0dXMnLFxuICAgICdBcmJ1dHVzIFNsYWInLFxuICAgICdBcmNoaXRlY3RzIERhdWdodGVyJyxcbiAgICAnQXJjaGl2bycsXG4gICAgJ0FyY2hpdm8gQmxhY2snLFxuICAgICdBcmNoaXZvIE5hcnJvdycsXG4gICAgJ0FyZSBZb3UgU2VyaW91cycsXG4gICAgJ0FyZWYgUnVxYWEnLFxuICAgICdBcmVmIFJ1cWFhIEluaycsXG4gICAgJ0FyaW1hJyxcbiAgICAnQXJpbW8nLFxuICAgICdBcml6b25pYScsXG4gICAgJ0FybWF0YScsXG4gICAgJ0Fyc2VuYWwnLFxuICAgICdBcnRpZmlrYScsXG4gICAgJ0Fydm8nLFxuICAgICdBcnlhJyxcbiAgICAnQXNhcCcsXG4gICAgJ0FzYXAgQ29uZGVuc2VkJyxcbiAgICAnQXNhcicsXG4gICAgJ0Fzc2V0JyxcbiAgICAnQXNzaXN0YW50JyxcbiAgICAnQXN0bG9jaCcsXG4gICAgJ0FzdWwnLFxuICAgICdBdGhpdGknLFxuICAgICdBdGtpbnNvbiBIeXBlcmxlZ2libGUnLFxuICAgICdBdG1hJyxcbiAgICAnQXRvbWljIEFnZScsXG4gICAgJ0F1YnJleScsXG4gICAgJ0F1ZGlvd2lkZScsXG4gICAgJ0F1dG91ciBPbmUnLFxuICAgICdBdmVyYWdlJyxcbiAgICAnQXZlcmFnZSBTYW5zJyxcbiAgICAnQXZlcmlhIEdydWVzYSBMaWJyZScsXG4gICAgJ0F2ZXJpYSBMaWJyZScsXG4gICAgJ0F2ZXJpYSBTYW5zIExpYnJlJyxcbiAgICAnQXZlcmlhIFNlcmlmIExpYnJlJyxcbiAgICAnQXplcmV0IE1vbm8nLFxuICAgICdCNjEyJyxcbiAgICAnQjYxMiBNb25vJyxcbiAgICAnQklaIFVER290aGljJyxcbiAgICAnQklaIFVETWluY2hvJyxcbiAgICAnQklaIFVEUEdvdGhpYycsXG4gICAgJ0JJWiBVRFBNaW5jaG8nLFxuICAgICdCYWJ5bG9uaWNhJyxcbiAgICAnQmFjYXNpbWUgQW50aXF1ZScsXG4gICAgJ0JhZCBTY3JpcHQnLFxuICAgICdCYWdlbCBGYXQgT25lJyxcbiAgICAnQmFoaWFuYScsXG4gICAgJ0JhaGlhbml0YScsXG4gICAgJ0JhaSBKYW1qdXJlZScsXG4gICAgJ0Jha2JhayBPbmUnLFxuICAgICdCYWxsZXQnLFxuICAgICdCYWxvbyAyJyxcbiAgICAnQmFsb28gQmhhaSAyJyxcbiAgICAnQmFsb28gQmhhaWphYW4gMicsXG4gICAgJ0JhbG9vIEJoYWluYSAyJyxcbiAgICAnQmFsb28gQ2hldHRhbiAyJyxcbiAgICAnQmFsb28gRGEgMicsXG4gICAgJ0JhbG9vIFBhYWppIDInLFxuICAgICdCYWxvbyBUYW1tYSAyJyxcbiAgICAnQmFsb28gVGFtbXVkdSAyJyxcbiAgICAnQmFsb28gVGhhbWJpIDInLFxuICAgICdCYWxzYW1pcSBTYW5zJyxcbiAgICAnQmFsdGhhemFyJyxcbiAgICAnQmFuZ2VycycsXG4gICAgJ0JhcmxvdycsXG4gICAgJ0JhcmxvdyBDb25kZW5zZWQnLFxuICAgICdCYXJsb3cgU2VtaSBDb25kZW5zZWQnLFxuICAgICdCYXJyaWVjaXRvJyxcbiAgICAnQmFycmlvJyxcbiAgICAnQmFzaWMnLFxuICAgICdCYXNrZXJ2dmlsbGUnLFxuICAgICdCYXR0YW1iYW5nJyxcbiAgICAnQmF1bWFucycsXG4gICAgJ0JheW9uJyxcbiAgICAnQmUgVmlldG5hbSBQcm8nLFxuICAgICdCZWF1IFJpdmFnZScsXG4gICAgJ0JlYmFzIE5ldWUnLFxuICAgICdCZWxhbm9zaW1hJyxcbiAgICAnQmVsZ3Jhbm8nLFxuICAgICdCZWxsZWZhaXInLFxuICAgICdCZWxsZXphJyxcbiAgICAnQmVsbG90YScsXG4gICAgJ0JlbGxvdGEgVGV4dCcsXG4gICAgJ0JlbmNoTmluZScsXG4gICAgJ0Jlbm5lJyxcbiAgICAnQmVudGhhbScsXG4gICAgJ0JlcmtzaGlyZSBTd2FzaCcsXG4gICAgJ0Jlc2xleScsXG4gICAgJ0JldGggRWxsZW4nLFxuICAgICdCZXZhbicsXG4gICAgJ0JodVR1a2EgRXhwYW5kZWQgT25lJyxcbiAgICAnQmlnIFNob3VsZGVycyBEaXNwbGF5JyxcbiAgICAnQmlnIFNob3VsZGVycyBJbmxpbmUgRGlzcGxheScsXG4gICAgJ0JpZyBTaG91bGRlcnMgSW5saW5lIFRleHQnLFxuICAgICdCaWcgU2hvdWxkZXJzIFN0ZW5jaWwgRGlzcGxheScsXG4gICAgJ0JpZyBTaG91bGRlcnMgU3RlbmNpbCBUZXh0JyxcbiAgICAnQmlnIFNob3VsZGVycyBUZXh0JyxcbiAgICAnQmlnZWxvdyBSdWxlcycsXG4gICAgJ0JpZ3Nob3QgT25lJyxcbiAgICAnQmlsYm8nLFxuICAgICdCaWxibyBTd2FzaCBDYXBzJyxcbiAgICAnQmlvUmh5bWUnLFxuICAgICdCaW9SaHltZSBFeHBhbmRlZCcsXG4gICAgJ0JpcnRoc3RvbmUnLFxuICAgICdCaXJ0aHN0b25lIEJvdW5jZScsXG4gICAgJ0JpcnlhbmknLFxuICAgICdCaXR0ZXInLFxuICAgICdCbGFjayBBbmQgV2hpdGUgUGljdHVyZScsXG4gICAgJ0JsYWNrIEhhbiBTYW5zJyxcbiAgICAnQmxhY2sgT3BzIE9uZScsXG4gICAgJ0JsYWthJyxcbiAgICAnQmxha2EgSG9sbG93JyxcbiAgICAnQmxha2EgSW5rJyxcbiAgICAnQmxpbmtlcicsXG4gICAgJ0JvZG9uaSBNb2RhJyxcbiAgICAnQm9rb3InLFxuICAgICdCb25hIE5vdmEnLFxuICAgICdCb25ib24nLFxuICAgICdCb25oZXVyIFJveWFsZScsXG4gICAgJ0Jvb2dhbG9vJyxcbiAgICAnQm9yZWwnLFxuICAgICdCb3dsYnkgT25lJyxcbiAgICAnQm93bGJ5IE9uZSBTQycsXG4gICAgJ0JyYWFoIE9uZScsXG4gICAgJ0JyYXdsZXInLFxuICAgICdCcmVlIFNlcmlmJyxcbiAgICAnQnJpY29sYWdlIEdyb3Rlc3F1ZScsXG4gICAgJ0JydW5vIEFjZScsXG4gICAgJ0JydW5vIEFjZSBTQycsXG4gICAgJ0JyeWdhZGEgMTkxOCcsXG4gICAgJ0J1YmJsZWd1bSBTYW5zJyxcbiAgICAnQnViYmxlciBPbmUnLFxuICAgICdCdWRhJyxcbiAgICAnQnVlbmFyZCcsXG4gICAgJ0J1bmdlZScsXG4gICAgJ0J1bmdlZSBIYWlybGluZScsXG4gICAgJ0J1bmdlZSBJbmxpbmUnLFxuICAgICdCdW5nZWUgT3V0bGluZScsXG4gICAgJ0J1bmdlZSBTaGFkZScsXG4gICAgJ0J1bmdlZSBTcGljZScsXG4gICAgJ0J1dGNoZXJtYW4nLFxuICAgICdCdXR0ZXJmbHkgS2lkcycsXG4gICAgJ0NhYmluJyxcbiAgICAnQ2FiaW4gQ29uZGVuc2VkJyxcbiAgICAnQ2FiaW4gU2tldGNoJyxcbiAgICAnQ2Flc2FyIERyZXNzaW5nJyxcbiAgICAnQ2FnbGlvc3RybycsXG4gICAgJ0NhaXJvJyxcbiAgICAnQ2Fpcm8gUGxheScsXG4gICAgJ0NhbGFkZWEnLFxuICAgICdDYWxpc3RvZ2EnLFxuICAgICdDYWxsaWdyYWZmaXR0aScsXG4gICAgJ0NhbWJheScsXG4gICAgJ0NhbWJvJyxcbiAgICAnQ2FuZGFsJyxcbiAgICAnQ2FudGFyZWxsJyxcbiAgICAnQ2FudGF0YSBPbmUnLFxuICAgICdDYW50b3JhIE9uZScsXG4gICAgJ0NhcHJhc2ltbycsXG4gICAgJ0NhcHJpb2xhJyxcbiAgICAnQ2FyYW1lbCcsXG4gICAgJ0NhcmF0dGVyZScsXG4gICAgJ0NhcmRvJyxcbiAgICAnQ2FybGl0bycsXG4gICAgJ0Nhcm1lJyxcbiAgICAnQ2Fycm9pcyBHb3RoaWMnLFxuICAgICdDYXJyb2lzIEdvdGhpYyBTQycsXG4gICAgJ0NhcnRlciBPbmUnLFxuICAgICdDYXN0b3JvJyxcbiAgICAnQ2FzdG9ybyBUaXRsaW5nJyxcbiAgICAnQ2F0YW1hcmFuJyxcbiAgICAnQ2F1ZGV4JyxcbiAgICAnQ2F2ZWF0JyxcbiAgICAnQ2F2ZWF0IEJydXNoJyxcbiAgICAnQ2VkYXJ2aWxsZSBDdXJzaXZlJyxcbiAgICAnQ2V2aWNoZSBPbmUnLFxuICAgICdDaGFrcmEgUGV0Y2gnLFxuICAgICdDaGFuZ2EnLFxuICAgICdDaGFuZ2EgT25lJyxcbiAgICAnQ2hhbmdvJyxcbiAgICAnQ2hhcmlzIFNJTCcsXG4gICAgJ0NoYXJtJyxcbiAgICAnQ2hhcm1vbm1hbicsXG4gICAgJ0NoYXRodXJhJyxcbiAgICAnQ2hhdSBQaGlsb21lbmUgT25lJyxcbiAgICAnQ2hlbGEgT25lJyxcbiAgICAnQ2hlbHNlYSBNYXJrZXQnLFxuICAgICdDaGVubGEnLFxuICAgICdDaGVyaXNoJyxcbiAgICAnQ2hlcnJ5IEJvbWIgT25lJyxcbiAgICAnQ2hlcnJ5IENyZWFtIFNvZGEnLFxuICAgICdDaGVycnkgU3dhc2gnLFxuICAgICdDaGV3eScsXG4gICAgJ0NoaWNsZScsXG4gICAgJ0NoaWxhbmthJyxcbiAgICAnQ2hpdm8nLFxuICAgICdDaGl2byBNb25vJyxcbiAgICAnQ2hva29rdXRhaScsXG4gICAgJ0Nob25idXJpJyxcbiAgICAnQ2luemVsJyxcbiAgICAnQ2luemVsIERlY29yYXRpdmUnLFxuICAgICdDbGlja2VyIFNjcmlwdCcsXG4gICAgJ0NsaW1hdGUgQ3Jpc2lzJyxcbiAgICAnQ29kYScsXG4gICAgJ0NvZHlzdGFyJyxcbiAgICAnQ29pbnknLFxuICAgICdDb21ibycsXG4gICAgJ0NvbWZvcnRhYScsXG4gICAgJ0NvbWZvcnRlcicsXG4gICAgJ0NvbWZvcnRlciBCcnVzaCcsXG4gICAgJ0NvbWljIE5ldWUnLFxuICAgICdDb21pbmcgU29vbicsXG4gICAgJ0NvbW1lJyxcbiAgICAnQ29tbWlzc2lvbmVyJyxcbiAgICAnQ29uY2VydCBPbmUnLFxuICAgICdDb25kaW1lbnQnLFxuICAgICdDb250ZW50JyxcbiAgICAnQ29udHJhaWwgT25lJyxcbiAgICAnQ29udmVyZ2VuY2UnLFxuICAgICdDb29raWUnLFxuICAgICdDb3BzZScsXG4gICAgJ0NvcmJlbicsXG4gICAgJ0NvcmludGhpYScsXG4gICAgJ0Nvcm1vcmFudCcsXG4gICAgJ0Nvcm1vcmFudCBHYXJhbW9uZCcsXG4gICAgJ0Nvcm1vcmFudCBJbmZhbnQnLFxuICAgICdDb3Jtb3JhbnQgU0MnLFxuICAgICdDb3Jtb3JhbnQgVW5pY2FzZScsXG4gICAgJ0Nvcm1vcmFudCBVcHJpZ2h0JyxcbiAgICAnQ291cmdldHRlJyxcbiAgICAnQ291cmllciBQcmltZScsXG4gICAgJ0NvdXNpbmUnLFxuICAgICdDb3VzdGFyZCcsXG4gICAgJ0NvdmVyZWQgQnkgWW91ciBHcmFjZScsXG4gICAgJ0NyYWZ0eSBHaXJscycsXG4gICAgJ0NyZWVwc3RlcicsXG4gICAgJ0NyZXRlIFJvdW5kJyxcbiAgICAnQ3JpbXNvbiBQcm8nLFxuICAgICdDcmltc29uIFRleHQnLFxuICAgICdDcm9pc3NhbnQgT25lJyxcbiAgICAnQ3J1c2hlZCcsXG4gICAgJ0N1cHJ1bScsXG4gICAgJ0N1dGUgRm9udCcsXG4gICAgJ0N1dGl2ZScsXG4gICAgJ0N1dGl2ZSBNb25vJyxcbiAgICAnRE0gTW9ubycsXG4gICAgJ0RNIFNhbnMnLFxuICAgICdETSBTZXJpZiBEaXNwbGF5JyxcbiAgICAnRE0gU2VyaWYgVGV4dCcsXG4gICAgJ0RhaSBCYW5uYSBTSUwnLFxuICAgICdEYW1pb24nLFxuICAgICdEYW5jaW5nIFNjcmlwdCcsXG4gICAgJ0RhbmdyZWsnLFxuICAgICdEYXJrZXIgR3JvdGVzcXVlJyxcbiAgICAnRGFydW1hZHJvcCBPbmUnLFxuICAgICdEYXZpZCBMaWJyZScsXG4gICAgJ0Rhd25pbmcgb2YgYSBOZXcgRGF5JyxcbiAgICAnRGF5cyBPbmUnLFxuICAgICdEZWtrbycsXG4gICAgJ0RlbGEgR290aGljIE9uZScsXG4gICAgJ0RlbGljaW91cyBIYW5kcmF3bicsXG4gICAgJ0RlbGl1cycsXG4gICAgJ0RlbGl1cyBTd2FzaCBDYXBzJyxcbiAgICAnRGVsaXVzIFVuaWNhc2UnLFxuICAgICdEZWxsYSBSZXNwaXJhJyxcbiAgICAnRGVuayBPbmUnLFxuICAgICdEZXZvbnNoaXJlJyxcbiAgICAnRGh1cmphdGknLFxuICAgICdEaWRhY3QgR290aGljJyxcbiAgICAnRGlwaHlsbGVpYScsXG4gICAgJ0RpcGxvbWF0YScsXG4gICAgJ0RpcGxvbWF0YSBTQycsXG4gICAgJ0RvIEh5ZW9uJyxcbiAgICAnRG9rZG8nLFxuICAgICdEb21pbmUnLFxuICAgICdEb25lZ2FsIE9uZScsXG4gICAgJ0RvbmdsZScsXG4gICAgJ0RvcHBpbyBPbmUnLFxuICAgICdEb3JzYScsXG4gICAgJ0Rvc2lzJyxcbiAgICAnRG90R290aGljMTYnLFxuICAgICdEciBTdWdpeWFtYScsXG4gICAgJ0R1cnUgU2FucycsXG4gICAgJ0R5bmFQdWZmJyxcbiAgICAnRHluYWxpZ2h0JyxcbiAgICAnRUIgR2FyYW1vbmQnLFxuICAgICdFYWdsZSBMYWtlJyxcbiAgICAnRWFzdCBTZWEgRG9rZG8nLFxuICAgICdFYXRlcicsXG4gICAgJ0Vjb25vbWljYScsXG4gICAgJ0VjemFyJyxcbiAgICAnRWR1IE5TVyBBQ1QgRm91bmRhdGlvbicsXG4gICAgJ0VkdSBRTEQgQmVnaW5uZXInLFxuICAgICdFZHUgU0EgQmVnaW5uZXInLFxuICAgICdFZHUgVEFTIEJlZ2lubmVyJyxcbiAgICAnRWR1IFZJQyBXQSBOVCBCZWdpbm5lcicsXG4gICAgJ0VsIE1lc3NpcmknLFxuICAgICdFbGVjdHJvbGl6ZScsXG4gICAgJ0Vsc2llJyxcbiAgICAnRWxzaWUgU3dhc2ggQ2FwcycsXG4gICAgJ0VtYmxlbWEgT25lJyxcbiAgICAnRW1pbHlzIENhbmR5JyxcbiAgICAnRW5jb2RlIFNhbnMnLFxuICAgICdFbmNvZGUgU2FucyBDb25kZW5zZWQnLFxuICAgICdFbmNvZGUgU2FucyBFeHBhbmRlZCcsXG4gICAgJ0VuY29kZSBTYW5zIFNDJyxcbiAgICAnRW5jb2RlIFNhbnMgU2VtaSBDb25kZW5zZWQnLFxuICAgICdFbmNvZGUgU2FucyBTZW1pIEV4cGFuZGVkJyxcbiAgICAnRW5nYWdlbWVudCcsXG4gICAgJ0VuZ2xlYmVydCcsXG4gICAgJ0VucmlxdWV0YScsXG4gICAgJ0VwaGVzaXMnLFxuICAgICdFcGlsb2d1ZScsXG4gICAgJ0VyaWNhIE9uZScsXG4gICAgJ0VzdGViYW4nLFxuICAgICdFc3RvbmlhJyxcbiAgICAnRXVwaG9yaWEgU2NyaXB0JyxcbiAgICAnRXdlcnQnLFxuICAgICdFeG8nLFxuICAgICdFeG8gMicsXG4gICAgJ0V4cGxldHVzIFNhbnMnLFxuICAgICdFeHBsb3JhJyxcbiAgICAnRmFoa3dhbmcnLFxuICAgICdGYW1pbGplbiBHcm90ZXNrJyxcbiAgICAnRmFud29vZCBUZXh0JyxcbiAgICAnRmFycm8nLFxuICAgICdGYXJzYW4nLFxuICAgICdGYXNjaW5hdGUnLFxuICAgICdGYXNjaW5hdGUgSW5saW5lJyxcbiAgICAnRmFzdGVyIE9uZScsXG4gICAgJ0Zhc3RoYW5kJyxcbiAgICAnRmF1bmEgT25lJyxcbiAgICAnRmF1c3RpbmEnLFxuICAgICdGZWRlcmFudCcsXG4gICAgJ0ZlZGVybycsXG4gICAgJ0ZlbGlwYScsXG4gICAgJ0Zlbml4JyxcbiAgICAnRmVzdGl2ZScsXG4gICAgJ0ZpZ3RyZWUnLFxuICAgICdGaW5nZXIgUGFpbnQnLFxuICAgICdGaW5sYW5kaWNhJyxcbiAgICAnRmlyYSBDb2RlJyxcbiAgICAnRmlyYSBNb25vJyxcbiAgICAnRmlyYSBTYW5zJyxcbiAgICAnRmlyYSBTYW5zIENvbmRlbnNlZCcsXG4gICAgJ0ZpcmEgU2FucyBFeHRyYSBDb25kZW5zZWQnLFxuICAgICdGamFsbGEgT25lJyxcbiAgICAnRmpvcmQgT25lJyxcbiAgICAnRmxhbWVuY28nLFxuICAgICdGbGF2b3JzJyxcbiAgICAnRmxldXIgRGUgTGVhaCcsXG4gICAgJ0Zsb3cgQmxvY2snLFxuICAgICdGbG93IENpcmN1bGFyJyxcbiAgICAnRmxvdyBSb3VuZGVkJyxcbiAgICAnRm9sZGl0JyxcbiAgICAnRm9uZGFtZW50bycsXG4gICAgJ0ZvbnRkaW5lciBTd2Fua3knLFxuICAgICdGb3J1bScsXG4gICAgJ0ZyYWdtZW50IE1vbm8nLFxuICAgICdGcmFuY29pcyBPbmUnLFxuICAgICdGcmFuayBSdWhsIExpYnJlJyxcbiAgICAnRnJhdW5jZXMnLFxuICAgICdGcmVja2xlIEZhY2UnLFxuICAgICdGcmVkZXJpY2thIHRoZSBHcmVhdCcsXG4gICAgJ0ZyZWRva2EnLFxuICAgICdGcmVlaGFuZCcsXG4gICAgJ0ZyZXNjYScsXG4gICAgJ0ZyaWpvbGUnLFxuICAgICdGcnVrdHVyJyxcbiAgICAnRnVnYXogT25lJyxcbiAgICAnRnVnZ2xlcycsXG4gICAgJ0Z1enp5IEJ1YmJsZXMnLFxuICAgICdHRlMgRGlkb3QnLFxuICAgICdHRlMgTmVvaGVsbGVuaWMnLFxuICAgICdHYWJhcml0bycsXG4gICAgJ0dhYnJpZWxhJyxcbiAgICAnR2FlZ3UnLFxuICAgICdHYWZhdGEnLFxuICAgICdHYWpyYWogT25lJyxcbiAgICAnR2FsYWRhJyxcbiAgICAnR2FsZGVhbm8nLFxuICAgICdHYWxpbmRvJyxcbiAgICAnR2FtamEgRmxvd2VyJyxcbiAgICAnR2FudGFyaScsXG4gICAgJ0dhc29layBPbmUnLFxuICAgICdHYXlhdGhyaScsXG4gICAgJ0dlbGFzaW8nLFxuICAgICdHZW11bnUgTGlicmUnLFxuICAgICdHZW5vcycsXG4gICAgJ0dlbnRpdW0gQm9vayBQbHVzJyxcbiAgICAnR2VudGl1bSBQbHVzJyxcbiAgICAnR2VvJyxcbiAgICAnR2VvbG9naWNhJyxcbiAgICAnR2VvcmFtYScsXG4gICAgJ0dlb3N0YXInLFxuICAgICdHZW9zdGFyIEZpbGwnLFxuICAgICdHZXJtYW5pYSBPbmUnLFxuICAgICdHaWRlb24gUm9tYW4nLFxuICAgICdHaWR1Z3UnLFxuICAgICdHaWxkYSBEaXNwbGF5JyxcbiAgICAnR2lyYXNzb2wnLFxuICAgICdHaXZlIFlvdSBHbG9yeScsXG4gICAgJ0dsYXNzIEFudGlxdWEnLFxuICAgICdHbGVnb28nLFxuICAgICdHbG9vY2snLFxuICAgICdHbG9yaWEgSGFsbGVsdWphaCcsXG4gICAgJ0dsb3J5JyxcbiAgICAnR2x1dGVuJyxcbiAgICAnR29ibGluIE9uZScsXG4gICAgJ0dvY2hpIEhhbmQnLFxuICAgICdHb2xkbWFuJyxcbiAgICAnR29sb3MgVGV4dCcsXG4gICAgJ0dvcmRpdGFzJyxcbiAgICAnR290aGljIEExJyxcbiAgICAnR290dScsXG4gICAgJ0dvdWR5IEJvb2tsZXR0ZXIgMTkxMScsXG4gICAgJ0dvd3VuIEJhdGFuZycsXG4gICAgJ0dvd3VuIERvZHVtJyxcbiAgICAnR3JhZHVhdGUnLFxuICAgICdHcmFuZCBIb3RlbCcsXG4gICAgJ0dyYW5kaWZsb3JhIE9uZScsXG4gICAgJ0dyYW5kc3RhbmRlcicsXG4gICAgJ0dyYXBlIE51dHMnLFxuICAgICdHcmF2aXRhcyBPbmUnLFxuICAgICdHcmVhdCBWaWJlcycsXG4gICAgJ0dyZWNoZW4gRnVlbWVuJyxcbiAgICAnR3JlbnplJyxcbiAgICAnR3JlbnplIEdvdGlzY2gnLFxuICAgICdHcmV5IFFvJyxcbiAgICAnR3JpZmZ5JyxcbiAgICAnR3J1cHBvJyxcbiAgICAnR3VkZWEnLFxuICAgICdHdWdpJyxcbiAgICAnR3VsemFyJyxcbiAgICAnR3VwdGVyJyxcbiAgICAnR3VyYWphZGEnLFxuICAgICdHd2VuZG9seW4nLFxuICAgICdIYWJpYmknLFxuICAgICdIYWNoaSBNYXJ1IFBvcCcsXG4gICAgJ0hhaG1sZXQnLFxuICAgICdIYWxhbnQnLFxuICAgICdIYW1tZXJzbWl0aCBPbmUnLFxuICAgICdIYW5hbGVpJyxcbiAgICAnSGFuYWxlaSBGaWxsJyxcbiAgICAnSGFuZGpldCcsXG4gICAgJ0hhbmRsZWUnLFxuICAgICdIYW5rZW4gR3JvdGVzaycsXG4gICAgJ0hhbnVtYW4nLFxuICAgICdIYXBweSBNb25rZXknLFxuICAgICdIYXJtYXR0YW4nLFxuICAgICdIZWFkbGFuZCBPbmUnLFxuICAgICdIZWVibycsXG4gICAgJ0hlbm55IFBlbm55JyxcbiAgICAnSGVwdGEgU2xhYicsXG4gICAgJ0hlcnIgVm9uIE11ZWxsZXJob2ZmJyxcbiAgICAnSGkgTWVsb2R5JyxcbiAgICAnSGluYSBNaW5jaG8nLFxuICAgICdIaW5kJyxcbiAgICAnSGluZCBHdW50dXInLFxuICAgICdIaW5kIE1hZHVyYWknLFxuICAgICdIaW5kIFNpbGlndXJpJyxcbiAgICAnSGluZCBWYWRvZGFyYScsXG4gICAgJ0hvbHR3b29kIE9uZSBTQycsXG4gICAgJ0hvbWVtYWRlIEFwcGxlJyxcbiAgICAnSG9tZW5hamUnLFxuICAgICdIdWJiYWxsaScsXG4gICAgJ0h1cnJpY2FuZScsXG4gICAgJ0lCTSBQbGV4IE1vbm8nLFxuICAgICdJQk0gUGxleCBTYW5zJyxcbiAgICAnSUJNIFBsZXggU2FucyBBcmFiaWMnLFxuICAgICdJQk0gUGxleCBTYW5zIENvbmRlbnNlZCcsXG4gICAgJ0lCTSBQbGV4IFNhbnMgRGV2YW5hZ2FyaScsXG4gICAgJ0lCTSBQbGV4IFNhbnMgSGVicmV3JyxcbiAgICAnSUJNIFBsZXggU2FucyBKUCcsXG4gICAgJ0lCTSBQbGV4IFNhbnMgS1InLFxuICAgICdJQk0gUGxleCBTYW5zIFRoYWknLFxuICAgICdJQk0gUGxleCBTYW5zIFRoYWkgTG9vcGVkJyxcbiAgICAnSUJNIFBsZXggU2VyaWYnLFxuICAgICdJTSBGZWxsIERXIFBpY2EnLFxuICAgICdJTSBGZWxsIERXIFBpY2EgU0MnLFxuICAgICdJTSBGZWxsIERvdWJsZSBQaWNhJyxcbiAgICAnSU0gRmVsbCBEb3VibGUgUGljYSBTQycsXG4gICAgJ0lNIEZlbGwgRW5nbGlzaCcsXG4gICAgJ0lNIEZlbGwgRW5nbGlzaCBTQycsXG4gICAgJ0lNIEZlbGwgRnJlbmNoIENhbm9uJyxcbiAgICAnSU0gRmVsbCBGcmVuY2ggQ2Fub24gU0MnLFxuICAgICdJTSBGZWxsIEdyZWF0IFByaW1lcicsXG4gICAgJ0lNIEZlbGwgR3JlYXQgUHJpbWVyIFNDJyxcbiAgICAnSWJhcnJhIFJlYWwgTm92YScsXG4gICAgJ0ljZWJlcmcnLFxuICAgICdJY2VsYW5kJyxcbiAgICAnSW1idWUnLFxuICAgICdJbXBlcmlhbCBTY3JpcHQnLFxuICAgICdJbXByaW1hJyxcbiAgICAnSW5jbHVzaXZlIFNhbnMnLFxuICAgICdJbmNvbnNvbGF0YScsXG4gICAgJ0luZGVyJyxcbiAgICAnSW5kaWUgRmxvd2VyJyxcbiAgICAnSW5ncmlkIERhcmxpbmcnLFxuICAgICdJbmlrYScsXG4gICAgJ0lua251dCBBbnRpcXVhJyxcbiAgICAnSW5yaWEgU2FucycsXG4gICAgJ0lucmlhIFNlcmlmJyxcbiAgICAnSW5zcGlyYXRpb24nLFxuICAgICdJbnN0cnVtZW50IFNhbnMnLFxuICAgICdJbnN0cnVtZW50IFNlcmlmJyxcbiAgICAnSW50ZXInLFxuICAgICdJbnRlciBUaWdodCcsXG4gICAgJ0lyaXNoIEdyb3ZlcicsXG4gICAgJ0lzbGFuZCBNb21lbnRzJyxcbiAgICAnSXN0b2sgV2ViJyxcbiAgICAnSXRhbGlhbmEnLFxuICAgICdJdGFsaWFubm8nLFxuICAgICdJdGltJyxcbiAgICAnSmFjcXVlcyBGcmFuY29pcycsXG4gICAgJ0phY3F1ZXMgRnJhbmNvaXMgU2hhZG93JyxcbiAgICAnSmFsZGknLFxuICAgICdKZXRCcmFpbnMgTW9ubycsXG4gICAgJ0ppbSBOaWdodHNoYWRlJyxcbiAgICAnSm9hbicsXG4gICAgJ0pvY2tleSBPbmUnLFxuICAgICdKb2xseSBMb2RnZXInLFxuICAgICdKb21odXJpYScsXG4gICAgJ0pvbW9saGFyaScsXG4gICAgJ0pvc2VmaW4gU2FucycsXG4gICAgJ0pvc2VmaW4gU2xhYicsXG4gICAgJ0pvc3QnLFxuICAgICdKb3RpIE9uZScsXG4gICAgJ0p1YScsXG4gICAgJ0p1ZHNvbicsXG4gICAgJ0p1bGVlJyxcbiAgICAnSnVsaXVzIFNhbnMgT25lJyxcbiAgICAnSnVuZ2UnLFxuICAgICdKdXJhJyxcbiAgICAnSnVzdCBBbm90aGVyIEhhbmQnLFxuICAgICdKdXN0IE1lIEFnYWluIERvd24gSGVyZScsXG4gICAgJ0syRCcsXG4gICAgJ0thYmxhbW1vJyxcbiAgICAnS2Fkd2EnLFxuICAgICdLYWlzZWkgRGVjb2wnLFxuICAgICdLYWlzZWkgSGFydW5vVW1pJyxcbiAgICAnS2Fpc2VpIE9wdGknLFxuICAgICdLYWlzZWkgVG9rdW1pbicsXG4gICAgJ0thbGFtJyxcbiAgICAnS2FtZXJvbicsXG4gICAgJ0thbml0JyxcbiAgICAnS2FudHVtcnV5IFBybycsXG4gICAgJ0thcmFudGluYScsXG4gICAgJ0thcmxhJyxcbiAgICAnS2FybWEnLFxuICAgICdLYXRpYmVoJyxcbiAgICAnS2F1c2hhbiBTY3JpcHQnLFxuICAgICdLYXZpdmFuYXInLFxuICAgICdLYXZvb24nLFxuICAgICdLYXkgUGhvIER1JyxcbiAgICAnS2RhbSBUaG1vciBQcm8nLFxuICAgICdLZWFuaWEgT25lJyxcbiAgICAnS2VsbHkgU2xhYicsXG4gICAgJ0tlbmlhJyxcbiAgICAnS2hhbmQnLFxuICAgICdLaG1lcicsXG4gICAgJ0todWxhJyxcbiAgICAnS2luZ3MnLFxuICAgICdLaXJhbmcgSGFlcmFuZycsXG4gICAgJ0tpdGUgT25lJyxcbiAgICAnS2l3aSBNYXJ1JyxcbiAgICAnS2xlZSBPbmUnLFxuICAgICdLbmV3YXZlJyxcbiAgICAnS29IbycsXG4gICAgJ0tvZGNoYXNhbicsXG4gICAgJ0tvaCBTYW50ZXBoZWFwJyxcbiAgICAnS29sa2VyIEJydXNoJyxcbiAgICAnS29ua2htZXIgU2xlb2tjaGhlcicsXG4gICAgJ0tvc3VnaScsXG4gICAgJ0tvc3VnaSBNYXJ1JyxcbiAgICAnS290dGEgT25lJyxcbiAgICAnS291bGVuJyxcbiAgICAnS3Jhbmt5JyxcbiAgICAnS3Jlb24nLFxuICAgICdLcmlzdGknLFxuICAgICdLcm9uYSBPbmUnLFxuICAgICdLcnViJyxcbiAgICAnS3VmYW0nLFxuICAgICdLdWxpbSBQYXJrJyxcbiAgICAnS3VtYXIgT25lJyxcbiAgICAnS3VtYXIgT25lIE91dGxpbmUnLFxuICAgICdLdW1iaCBTYW5zJyxcbiAgICAnS3VyYWxlJyxcbiAgICAnTGEgQmVsbGUgQXVyb3JlJyxcbiAgICAnTGFicmFkYScsXG4gICAgJ0xhY3F1ZXInLFxuICAgICdMYWlsYScsXG4gICAgJ0xha2tpIFJlZGR5JyxcbiAgICAnTGFsZXphcicsXG4gICAgJ0xhbmNlbG90JyxcbiAgICAnTGFuZ2FyJyxcbiAgICAnTGF0ZWVmJyxcbiAgICAnTGF0bycsXG4gICAgJ0xhdmlzaGx5IFlvdXJzJyxcbiAgICAnTGVhZ3VlIEdvdGhpYycsXG4gICAgJ0xlYWd1ZSBTY3JpcHQnLFxuICAgICdMZWFndWUgU3BhcnRhbicsXG4gICAgJ0xlY2tlcmxpIE9uZScsXG4gICAgJ0xlZGdlcicsXG4gICAgJ0xla3RvbicsXG4gICAgJ0xlbW9uJyxcbiAgICAnTGVtb25hZGEnLFxuICAgICdMZXhlbmQnLFxuICAgICdMZXhlbmQgRGVjYScsXG4gICAgJ0xleGVuZCBFeGEnLFxuICAgICdMZXhlbmQgR2lnYScsXG4gICAgJ0xleGVuZCBNZWdhJyxcbiAgICAnTGV4ZW5kIFBldGEnLFxuICAgICdMZXhlbmQgVGVyYScsXG4gICAgJ0xleGVuZCBaZXR0YScsXG4gICAgJ0xpYnJlIEJhcmNvZGUgMTI4JyxcbiAgICAnTGlicmUgQmFyY29kZSAxMjggVGV4dCcsXG4gICAgJ0xpYnJlIEJhcmNvZGUgMzknLFxuICAgICdMaWJyZSBCYXJjb2RlIDM5IEV4dGVuZGVkJyxcbiAgICAnTGlicmUgQmFyY29kZSAzOSBFeHRlbmRlZCBUZXh0JyxcbiAgICAnTGlicmUgQmFyY29kZSAzOSBUZXh0JyxcbiAgICAnTGlicmUgQmFyY29kZSBFQU4xMyBUZXh0JyxcbiAgICAnTGlicmUgQmFza2VydmlsbGUnLFxuICAgICdMaWJyZSBCb2RvbmknLFxuICAgICdMaWJyZSBDYXNsb24gRGlzcGxheScsXG4gICAgJ0xpYnJlIENhc2xvbiBUZXh0JyxcbiAgICAnTGlicmUgRnJhbmtsaW4nLFxuICAgICdMaWNvcmljZScsXG4gICAgJ0xpZmUgU2F2ZXJzJyxcbiAgICAnTGlsaXRhIE9uZScsXG4gICAgJ0xpbHkgU2NyaXB0IE9uZScsXG4gICAgJ0xpbWVsaWdodCcsXG4gICAgJ0xpbmRlbiBIaWxsJyxcbiAgICAnTGluZWZvbnQnLFxuICAgICdMaXN1IEJvc2EnLFxuICAgICdMaXRlcmF0YScsXG4gICAgJ0xpdSBKaWFuIE1hbyBDYW8nLFxuICAgICdMaXZ2aWMnLFxuICAgICdMb2JzdGVyJyxcbiAgICAnTG9ic3RlciBUd28nLFxuICAgICdMb25kcmluYSBPdXRsaW5lJyxcbiAgICAnTG9uZHJpbmEgU2hhZG93JyxcbiAgICAnTG9uZHJpbmEgU2tldGNoJyxcbiAgICAnTG9uZHJpbmEgU29saWQnLFxuICAgICdMb25nIENhbmcnLFxuICAgICdMb3JhJyxcbiAgICAnTG92ZSBMaWdodCcsXG4gICAgJ0xvdmUgWWEgTGlrZSBBIFNpc3RlcicsXG4gICAgJ0xvdmVkIGJ5IHRoZSBLaW5nJyxcbiAgICAnTG92ZXJzIFF1YXJyZWwnLFxuICAgICdMdWNraWVzdCBHdXknLFxuICAgICdMdWdyYXNpbW8nLFxuICAgICdMdW1hbm9zaW1vJyxcbiAgICAnTHVuYXNpbWEnLFxuICAgICdMdXNpdGFuYScsXG4gICAgJ0x1c3RyaWEnLFxuICAgICdMdXh1cmlvdXMgUm9tYW4nLFxuICAgICdMdXh1cmlvdXMgU2NyaXB0JyxcbiAgICAnTSBQTFVTIDEnLFxuICAgICdNIFBMVVMgMSBDb2RlJyxcbiAgICAnTSBQTFVTIDFwJyxcbiAgICAnTSBQTFVTIDInLFxuICAgICdNIFBMVVMgQ29kZSBMYXRpbicsXG4gICAgJ00gUExVUyBSb3VuZGVkIDFjJyxcbiAgICAnTWEgU2hhbiBaaGVuZycsXG4gICAgJ01hY29uZG8nLFxuICAgICdNYWNvbmRvIFN3YXNoIENhcHMnLFxuICAgICdNYWRhJyxcbiAgICAnTWFncmEnLFxuICAgICdNYWlkZW4gT3JhbmdlJyxcbiAgICAnTWFpdHJlZScsXG4gICAgJ01ham9yIE1vbm8gRGlzcGxheScsXG4gICAgJ01ha28nLFxuICAgICdNYWxpJyxcbiAgICAnTWFsbGFubmEnLFxuICAgICdNYW5kYWxpJyxcbiAgICAnTWFuamFyaScsXG4gICAgJ01hbnJvcGUnLFxuICAgICdNYW5zYWx2YScsXG4gICAgJ01hbnVhbGUnLFxuICAgICdNYXJjZWxsdXMnLFxuICAgICdNYXJjZWxsdXMgU0MnLFxuICAgICdNYXJjayBTY3JpcHQnLFxuICAgICdNYXJnYXJpbmUnLFxuICAgICdNYXJoZXknLFxuICAgICdNYXJrYXppIFRleHQnLFxuICAgICdNYXJrbyBPbmUnLFxuICAgICdNYXJtZWxhZCcsXG4gICAgJ01hcnRlbCcsXG4gICAgJ01hcnRlbCBTYW5zJyxcbiAgICAnTWFydGlhbiBNb25vJyxcbiAgICAnTWFydmVsJyxcbiAgICAnTWF0ZScsXG4gICAgJ01hdGUgU0MnLFxuICAgICdNYXZlbiBQcm8nLFxuICAgICdNY0xhcmVuJyxcbiAgICAnTWVhIEN1bHBhJyxcbiAgICAnTWVkZG9uJyxcbiAgICAnTWVkaWV2YWxTaGFycCcsXG4gICAgJ01lZHVsYSBPbmUnLFxuICAgICdNZWVyYSBJbmltYWknLFxuICAgICdNZWdyaW0nLFxuICAgICdNZWllIFNjcmlwdCcsXG4gICAgJ01lb3cgU2NyaXB0JyxcbiAgICAnTWVyaWVuZGEnLFxuICAgICdNZXJyaXdlYXRoZXInLFxuICAgICdNZXJyaXdlYXRoZXIgU2FucycsXG4gICAgJ01ldGFsJyxcbiAgICAnTWV0YWwgTWFuaWEnLFxuICAgICdNZXRhbW9ycGhvdXMnLFxuICAgICdNZXRyb3Bob2JpYycsXG4gICAgJ01pY2hyb21hJyxcbiAgICAnTWlsb25nYScsXG4gICAgJ01pbHRvbmlhbicsXG4gICAgJ01pbHRvbmlhbiBUYXR0b28nLFxuICAgICdNaW5hJyxcbiAgICAnTWluZ3phdCcsXG4gICAgJ01pbml2ZXInLFxuICAgICdNaXJpYW0gTGlicmUnLFxuICAgICdNaXJ6YScsXG4gICAgJ01pc3MgRmFqYXJkb3NlJyxcbiAgICAnTWl0cicsXG4gICAgJ01vY2hpeSBQb3AgT25lJyxcbiAgICAnTW9jaGl5IFBvcCBQIE9uZScsXG4gICAgJ01vZGFrJyxcbiAgICAnTW9kZXJuIEFudGlxdWEnLFxuICAgICdNb2dyYScsXG4gICAgJ01vaGF2ZScsXG4gICAgJ01vaXJhaSBPbmUnLFxuICAgICdNb2xlbmdvJyxcbiAgICAnTW9sbGUnLFxuICAgICdNb25kYScsXG4gICAgJ01vbm9mZXR0JyxcbiAgICAnTW9ub21hbmlhYyBPbmUnLFxuICAgICdNb25vdG9uJyxcbiAgICAnTW9uc2lldXIgTGEgRG91bGFpc2UnLFxuICAgICdNb250YWdhJyxcbiAgICAnTW9udGFndSBTbGFiJyxcbiAgICAnTW9udGVDYXJsbycsXG4gICAgJ01vbnRleicsXG4gICAgJ01vbnRzZXJyYXQnLFxuICAgICdNb250c2VycmF0IEFsdGVybmF0ZXMnLFxuICAgICdNb250c2VycmF0IFN1YnJheWFkYScsXG4gICAgJ01vbyBMYWggTGFoJyxcbiAgICAnTW9vbGknLFxuICAgICdNb29uIERhbmNlJyxcbiAgICAnTW91bCcsXG4gICAgJ01vdWxwYWxpJyxcbiAgICAnTW91bnRhaW5zIG9mIENocmlzdG1hcycsXG4gICAgJ01vdXNlIE1lbW9pcnMnLFxuICAgICdNciBCZWRmb3J0JyxcbiAgICAnTXIgRGFmb2UnLFxuICAgICdNciBEZSBIYXZpbGFuZCcsXG4gICAgJ01ycyBTYWludCBEZWxhZmllbGQnLFxuICAgICdNcnMgU2hlcHBhcmRzJyxcbiAgICAnTXMgTWFkaScsXG4gICAgJ011a3RhJyxcbiAgICAnTXVrdGEgTWFoZWUnLFxuICAgICdNdWt0YSBNYWxhcicsXG4gICAgJ011a3RhIFZhYW5pJyxcbiAgICAnTXVsaXNoJyxcbiAgICAnTXVyZWNobycsXG4gICAgJ011c2VvTW9kZXJubycsXG4gICAgJ015IFNvdWwnLFxuICAgICdNeW5lcnZlJyxcbiAgICAnTXlzdGVyeSBRdWVzdCcsXG4gICAgJ05UUicsXG4gICAgJ05hYmxhJyxcbiAgICAnTmFudW0gQnJ1c2ggU2NyaXB0JyxcbiAgICAnTmFudW0gR290aGljJyxcbiAgICAnTmFudW0gR290aGljIENvZGluZycsXG4gICAgJ05hbnVtIE15ZW9uZ2pvJyxcbiAgICAnTmFudW0gUGVuIFNjcmlwdCcsXG4gICAgJ05hcm5vb3InLFxuICAgICdOZW9uZGVydGhhdycsXG4gICAgJ05lcmtvIE9uZScsXG4gICAgJ05ldWNoYScsXG4gICAgJ05ldXRvbicsXG4gICAgJ05ldyBSb2NrZXInLFxuICAgICdOZXcgVGVnb21pbicsXG4gICAgJ05ld3MgQ3ljbGUnLFxuICAgICdOZXdzcmVhZGVyJyxcbiAgICAnTmljb25uZScsXG4gICAgJ05pcmFtaXQnLFxuICAgICdOaXhpZSBPbmUnLFxuICAgICdOb2JpbGUnLFxuICAgICdOb2tvcmEnLFxuICAgICdOb3JpY2FuJyxcbiAgICAnTm9zaWZlcicsXG4gICAgJ05vdGFibGUnLFxuICAgICdOb3RoaW5nIFlvdSBDb3VsZCBEbycsXG4gICAgJ05vdGljaWEgVGV4dCcsXG4gICAgJ05vdG8gQ29sb3IgRW1vamknLFxuICAgICdOb3RvIEVtb2ppJyxcbiAgICAnTm90byBLdWZpIEFyYWJpYycsXG4gICAgJ05vdG8gTXVzaWMnLFxuICAgICdOb3RvIE5hc2toIEFyYWJpYycsXG4gICAgJ05vdG8gTmFzdGFsaXEgVXJkdScsXG4gICAgJ05vdG8gUmFzaGkgSGVicmV3JyxcbiAgICAnTm90byBTYW5zJyxcbiAgICAnTm90byBTYW5zIEFkbGFtJyxcbiAgICAnTm90byBTYW5zIEFkbGFtIFVuam9pbmVkJyxcbiAgICAnTm90byBTYW5zIEFuYXRvbGlhbiBIaWVyb2dseXBocycsXG4gICAgJ05vdG8gU2FucyBBcmFiaWMnLFxuICAgICdOb3RvIFNhbnMgQXJtZW5pYW4nLFxuICAgICdOb3RvIFNhbnMgQXZlc3RhbicsXG4gICAgJ05vdG8gU2FucyBCYWxpbmVzZScsXG4gICAgJ05vdG8gU2FucyBCYW11bScsXG4gICAgJ05vdG8gU2FucyBCYXNzYSBWYWgnLFxuICAgICdOb3RvIFNhbnMgQmF0YWsnLFxuICAgICdOb3RvIFNhbnMgQmVuZ2FsaScsXG4gICAgJ05vdG8gU2FucyBCaGFpa3N1a2knLFxuICAgICdOb3RvIFNhbnMgQnJhaG1pJyxcbiAgICAnTm90byBTYW5zIEJ1Z2luZXNlJyxcbiAgICAnTm90byBTYW5zIEJ1aGlkJyxcbiAgICAnTm90byBTYW5zIENhbmFkaWFuIEFib3JpZ2luYWwnLFxuICAgICdOb3RvIFNhbnMgQ2FyaWFuJyxcbiAgICAnTm90byBTYW5zIENhdWNhc2lhbiBBbGJhbmlhbicsXG4gICAgJ05vdG8gU2FucyBDaGFrbWEnLFxuICAgICdOb3RvIFNhbnMgQ2hhbScsXG4gICAgJ05vdG8gU2FucyBDaGVyb2tlZScsXG4gICAgJ05vdG8gU2FucyBDaG9yYXNtaWFuJyxcbiAgICAnTm90byBTYW5zIENvcHRpYycsXG4gICAgJ05vdG8gU2FucyBDdW5laWZvcm0nLFxuICAgICdOb3RvIFNhbnMgQ3lwcmlvdCcsXG4gICAgJ05vdG8gU2FucyBDeXBybyBNaW5vYW4nLFxuICAgICdOb3RvIFNhbnMgRGVzZXJldCcsXG4gICAgJ05vdG8gU2FucyBEZXZhbmFnYXJpJyxcbiAgICAnTm90byBTYW5zIERpc3BsYXknLFxuICAgICdOb3RvIFNhbnMgRHVwbG95YW4nLFxuICAgICdOb3RvIFNhbnMgRWd5cHRpYW4gSGllcm9nbHlwaHMnLFxuICAgICdOb3RvIFNhbnMgRWxiYXNhbicsXG4gICAgJ05vdG8gU2FucyBFbHltYWljJyxcbiAgICAnTm90byBTYW5zIEV0aGlvcGljJyxcbiAgICAnTm90byBTYW5zIEdlb3JnaWFuJyxcbiAgICAnTm90byBTYW5zIEdsYWdvbGl0aWMnLFxuICAgICdOb3RvIFNhbnMgR290aGljJyxcbiAgICAnTm90byBTYW5zIEdyYW50aGEnLFxuICAgICdOb3RvIFNhbnMgR3VqYXJhdGknLFxuICAgICdOb3RvIFNhbnMgR3VuamFsYSBHb25kaScsXG4gICAgJ05vdG8gU2FucyBHdXJtdWtoaScsXG4gICAgJ05vdG8gU2FucyBISycsXG4gICAgJ05vdG8gU2FucyBIYW5pZmkgUm9oaW5neWEnLFxuICAgICdOb3RvIFNhbnMgSGFudW5vbycsXG4gICAgJ05vdG8gU2FucyBIYXRyYW4nLFxuICAgICdOb3RvIFNhbnMgSGVicmV3JyxcbiAgICAnTm90byBTYW5zIEltcGVyaWFsIEFyYW1haWMnLFxuICAgICdOb3RvIFNhbnMgSW5kaWMgU2l5YXEgTnVtYmVycycsXG4gICAgJ05vdG8gU2FucyBJbnNjcmlwdGlvbmFsIFBhaGxhdmknLFxuICAgICdOb3RvIFNhbnMgSW5zY3JpcHRpb25hbCBQYXJ0aGlhbicsXG4gICAgJ05vdG8gU2FucyBKUCcsXG4gICAgJ05vdG8gU2FucyBKYXZhbmVzZScsXG4gICAgJ05vdG8gU2FucyBLUicsXG4gICAgJ05vdG8gU2FucyBLYWl0aGknLFxuICAgICdOb3RvIFNhbnMgS2FubmFkYScsXG4gICAgJ05vdG8gU2FucyBLYXdpJyxcbiAgICAnTm90byBTYW5zIEtheWFoIExpJyxcbiAgICAnTm90byBTYW5zIEtoYXJvc2h0aGknLFxuICAgICdOb3RvIFNhbnMgS2htZXInLFxuICAgICdOb3RvIFNhbnMgS2hvamtpJyxcbiAgICAnTm90byBTYW5zIEtodWRhd2FkaScsXG4gICAgJ05vdG8gU2FucyBMYW8nLFxuICAgICdOb3RvIFNhbnMgTGFvIExvb3BlZCcsXG4gICAgJ05vdG8gU2FucyBMZXBjaGEnLFxuICAgICdOb3RvIFNhbnMgTGltYnUnLFxuICAgICdOb3RvIFNhbnMgTGluZWFyIEEnLFxuICAgICdOb3RvIFNhbnMgTGluZWFyIEInLFxuICAgICdOb3RvIFNhbnMgTGlzdScsXG4gICAgJ05vdG8gU2FucyBMeWNpYW4nLFxuICAgICdOb3RvIFNhbnMgTHlkaWFuJyxcbiAgICAnTm90byBTYW5zIE1haGFqYW5pJyxcbiAgICAnTm90byBTYW5zIE1hbGF5YWxhbScsXG4gICAgJ05vdG8gU2FucyBNYW5kYWljJyxcbiAgICAnTm90byBTYW5zIE1hbmljaGFlYW4nLFxuICAgICdOb3RvIFNhbnMgTWFyY2hlbicsXG4gICAgJ05vdG8gU2FucyBNYXNhcmFtIEdvbmRpJyxcbiAgICAnTm90byBTYW5zIE1hdGgnLFxuICAgICdOb3RvIFNhbnMgTWF5YW4gTnVtZXJhbHMnLFxuICAgICdOb3RvIFNhbnMgTWVkZWZhaWRyaW4nLFxuICAgICdOb3RvIFNhbnMgTWVldGVpIE1heWVrJyxcbiAgICAnTm90byBTYW5zIE1lbmRlIEtpa2FrdWknLFxuICAgICdOb3RvIFNhbnMgTWVyb2l0aWMnLFxuICAgICdOb3RvIFNhbnMgTWlhbycsXG4gICAgJ05vdG8gU2FucyBNb2RpJyxcbiAgICAnTm90byBTYW5zIE1vbmdvbGlhbicsXG4gICAgJ05vdG8gU2FucyBNb25vJyxcbiAgICAnTm90byBTYW5zIE1ybycsXG4gICAgJ05vdG8gU2FucyBNdWx0YW5pJyxcbiAgICAnTm90byBTYW5zIE15YW5tYXInLFxuICAgICdOb3RvIFNhbnMgTktvJyxcbiAgICAnTm90byBTYW5zIE5LbyBVbmpvaW5lZCcsXG4gICAgJ05vdG8gU2FucyBOYWJhdGFlYW4nLFxuICAgICdOb3RvIFNhbnMgTmFnIE11bmRhcmknLFxuICAgICdOb3RvIFNhbnMgTmFuZGluYWdhcmknLFxuICAgICdOb3RvIFNhbnMgTmV3IFRhaSBMdWUnLFxuICAgICdOb3RvIFNhbnMgTmV3YScsXG4gICAgJ05vdG8gU2FucyBOdXNodScsXG4gICAgJ05vdG8gU2FucyBPZ2hhbScsXG4gICAgJ05vdG8gU2FucyBPbCBDaGlraScsXG4gICAgJ05vdG8gU2FucyBPbGQgSHVuZ2FyaWFuJyxcbiAgICAnTm90byBTYW5zIE9sZCBJdGFsaWMnLFxuICAgICdOb3RvIFNhbnMgT2xkIE5vcnRoIEFyYWJpYW4nLFxuICAgICdOb3RvIFNhbnMgT2xkIFBlcm1pYycsXG4gICAgJ05vdG8gU2FucyBPbGQgUGVyc2lhbicsXG4gICAgJ05vdG8gU2FucyBPbGQgU29nZGlhbicsXG4gICAgJ05vdG8gU2FucyBPbGQgU291dGggQXJhYmlhbicsXG4gICAgJ05vdG8gU2FucyBPbGQgVHVya2ljJyxcbiAgICAnTm90byBTYW5zIE9yaXlhJyxcbiAgICAnTm90byBTYW5zIE9zYWdlJyxcbiAgICAnTm90byBTYW5zIE9zbWFueWEnLFxuICAgICdOb3RvIFNhbnMgUGFoYXdoIEhtb25nJyxcbiAgICAnTm90byBTYW5zIFBhbG15cmVuZScsXG4gICAgJ05vdG8gU2FucyBQYXUgQ2luIEhhdScsXG4gICAgJ05vdG8gU2FucyBQaGFncyBQYScsXG4gICAgJ05vdG8gU2FucyBQaG9lbmljaWFuJyxcbiAgICAnTm90byBTYW5zIFBzYWx0ZXIgUGFobGF2aScsXG4gICAgJ05vdG8gU2FucyBSZWphbmcnLFxuICAgICdOb3RvIFNhbnMgUnVuaWMnLFxuICAgICdOb3RvIFNhbnMgU0MnLFxuICAgICdOb3RvIFNhbnMgU2FtYXJpdGFuJyxcbiAgICAnTm90byBTYW5zIFNhdXJhc2h0cmEnLFxuICAgICdOb3RvIFNhbnMgU2hhcmFkYScsXG4gICAgJ05vdG8gU2FucyBTaGF2aWFuJyxcbiAgICAnTm90byBTYW5zIFNpZGRoYW0nLFxuICAgICdOb3RvIFNhbnMgU2lnbldyaXRpbmcnLFxuICAgICdOb3RvIFNhbnMgU2luaGFsYScsXG4gICAgJ05vdG8gU2FucyBTb2dkaWFuJyxcbiAgICAnTm90byBTYW5zIFNvcmEgU29tcGVuZycsXG4gICAgJ05vdG8gU2FucyBTb3lvbWJvJyxcbiAgICAnTm90byBTYW5zIFN1bmRhbmVzZScsXG4gICAgJ05vdG8gU2FucyBTeWxvdGkgTmFncmknLFxuICAgICdOb3RvIFNhbnMgU3ltYm9scycsXG4gICAgJ05vdG8gU2FucyBTeW1ib2xzIDInLFxuICAgICdOb3RvIFNhbnMgU3lyaWFjJyxcbiAgICAnTm90byBTYW5zIFN5cmlhYyBFYXN0ZXJuJyxcbiAgICAnTm90byBTYW5zIFRDJyxcbiAgICAnTm90byBTYW5zIFRhZ2Fsb2cnLFxuICAgICdOb3RvIFNhbnMgVGFnYmFud2EnLFxuICAgICdOb3RvIFNhbnMgVGFpIExlJyxcbiAgICAnTm90byBTYW5zIFRhaSBUaGFtJyxcbiAgICAnTm90byBTYW5zIFRhaSBWaWV0JyxcbiAgICAnTm90byBTYW5zIFRha3JpJyxcbiAgICAnTm90byBTYW5zIFRhbWlsJyxcbiAgICAnTm90byBTYW5zIFRhbWlsIFN1cHBsZW1lbnQnLFxuICAgICdOb3RvIFNhbnMgVGFuZ3NhJyxcbiAgICAnTm90byBTYW5zIFRlbHVndScsXG4gICAgJ05vdG8gU2FucyBUaGFhbmEnLFxuICAgICdOb3RvIFNhbnMgVGhhaScsXG4gICAgJ05vdG8gU2FucyBUaGFpIExvb3BlZCcsXG4gICAgJ05vdG8gU2FucyBUaWZpbmFnaCcsXG4gICAgJ05vdG8gU2FucyBUaXJodXRhJyxcbiAgICAnTm90byBTYW5zIFVnYXJpdGljJyxcbiAgICAnTm90byBTYW5zIFZhaScsXG4gICAgJ05vdG8gU2FucyBWaXRoa3VxaScsXG4gICAgJ05vdG8gU2FucyBXYW5jaG8nLFxuICAgICdOb3RvIFNhbnMgV2FyYW5nIENpdGknLFxuICAgICdOb3RvIFNhbnMgWWknLFxuICAgICdOb3RvIFNhbnMgWmFuYWJhemFyIFNxdWFyZScsXG4gICAgJ05vdG8gU2VyaWYnLFxuICAgICdOb3RvIFNlcmlmIEFob20nLFxuICAgICdOb3RvIFNlcmlmIEFybWVuaWFuJyxcbiAgICAnTm90byBTZXJpZiBCYWxpbmVzZScsXG4gICAgJ05vdG8gU2VyaWYgQmVuZ2FsaScsXG4gICAgJ05vdG8gU2VyaWYgRGV2YW5hZ2FyaScsXG4gICAgJ05vdG8gU2VyaWYgRGlzcGxheScsXG4gICAgJ05vdG8gU2VyaWYgRG9ncmEnLFxuICAgICdOb3RvIFNlcmlmIEV0aGlvcGljJyxcbiAgICAnTm90byBTZXJpZiBHZW9yZ2lhbicsXG4gICAgJ05vdG8gU2VyaWYgR3JhbnRoYScsXG4gICAgJ05vdG8gU2VyaWYgR3VqYXJhdGknLFxuICAgICdOb3RvIFNlcmlmIEd1cm11a2hpJyxcbiAgICAnTm90byBTZXJpZiBISycsXG4gICAgJ05vdG8gU2VyaWYgSGVicmV3JyxcbiAgICAnTm90byBTZXJpZiBKUCcsXG4gICAgJ05vdG8gU2VyaWYgS1InLFxuICAgICdOb3RvIFNlcmlmIEthbm5hZGEnLFxuICAgICdOb3RvIFNlcmlmIEtoaXRhbiBTbWFsbCBTY3JpcHQnLFxuICAgICdOb3RvIFNlcmlmIEtobWVyJyxcbiAgICAnTm90byBTZXJpZiBLaG9qa2knLFxuICAgICdOb3RvIFNlcmlmIExhbycsXG4gICAgJ05vdG8gU2VyaWYgTWFrYXNhcicsXG4gICAgJ05vdG8gU2VyaWYgTWFsYXlhbGFtJyxcbiAgICAnTm90byBTZXJpZiBNeWFubWFyJyxcbiAgICAnTm90byBTZXJpZiBOUCBIbW9uZycsXG4gICAgJ05vdG8gU2VyaWYgT2xkIFV5Z2h1cicsXG4gICAgJ05vdG8gU2VyaWYgT3JpeWEnLFxuICAgICdOb3RvIFNlcmlmIE90dG9tYW4gU2l5YXEnLFxuICAgICdOb3RvIFNlcmlmIFNDJyxcbiAgICAnTm90byBTZXJpZiBTaW5oYWxhJyxcbiAgICAnTm90byBTZXJpZiBUQycsXG4gICAgJ05vdG8gU2VyaWYgVGFtaWwnLFxuICAgICdOb3RvIFNlcmlmIFRhbmd1dCcsXG4gICAgJ05vdG8gU2VyaWYgVGVsdWd1JyxcbiAgICAnTm90byBTZXJpZiBUaGFpJyxcbiAgICAnTm90byBTZXJpZiBUaWJldGFuJyxcbiAgICAnTm90byBTZXJpZiBUb3RvJyxcbiAgICAnTm90byBTZXJpZiBWaXRoa3VxaScsXG4gICAgJ05vdG8gU2VyaWYgWWV6aWRpJyxcbiAgICAnTm90byBUcmFkaXRpb25hbCBOdXNodScsXG4gICAgJ05vdmEgQ3V0JyxcbiAgICAnTm92YSBGbGF0JyxcbiAgICAnTm92YSBNb25vJyxcbiAgICAnTm92YSBPdmFsJyxcbiAgICAnTm92YSBSb3VuZCcsXG4gICAgJ05vdmEgU2NyaXB0JyxcbiAgICAnTm92YSBTbGltJyxcbiAgICAnTm92YSBTcXVhcmUnLFxuICAgICdOdW1hbnMnLFxuICAgICdOdW5pdG8nLFxuICAgICdOdW5pdG8gU2FucycsXG4gICAgJ051b3N1IFNJTCcsXG4gICAgJ09kaWJlZSBTYW5zJyxcbiAgICAnT2RvciBNZWFuIENoZXknLFxuICAgICdPZmZzaWRlJyxcbiAgICAnT2knLFxuICAgICdPbGQgU3RhbmRhcmQgVFQnLFxuICAgICdPbGRlbmJ1cmcnLFxuICAgICdPbGUnLFxuICAgICdPbGVvIFNjcmlwdCcsXG4gICAgJ09sZW8gU2NyaXB0IFN3YXNoIENhcHMnLFxuICAgICdPbmVzdCcsXG4gICAgJ09vb2ggQmFieScsXG4gICAgJ09wZW4gU2FucycsXG4gICAgJ09yYW5pZW5iYXVtJyxcbiAgICAnT3JiaXQnLFxuICAgICdPcmJpdHJvbicsXG4gICAgJ09yZWdhbm8nLFxuICAgICdPcmVsZWdhIE9uZScsXG4gICAgJ09yaWVudGEnLFxuICAgICdPcmlnaW5hbCBTdXJmZXInLFxuICAgICdPc3dhbGQnLFxuICAgICdPdXRmaXQnLFxuICAgICdPdmVyIHRoZSBSYWluYm93JyxcbiAgICAnT3ZlcmxvY2snLFxuICAgICdPdmVybG9jayBTQycsXG4gICAgJ092ZXJwYXNzJyxcbiAgICAnT3ZlcnBhc3MgTW9ubycsXG4gICAgJ092bycsXG4gICAgJ094YW5pdW0nLFxuICAgICdPeHlnZW4nLFxuICAgICdPeHlnZW4gTW9ubycsXG4gICAgJ1BUIE1vbm8nLFxuICAgICdQVCBTYW5zJyxcbiAgICAnUFQgU2FucyBDYXB0aW9uJyxcbiAgICAnUFQgU2FucyBOYXJyb3cnLFxuICAgICdQVCBTZXJpZicsXG4gICAgJ1BUIFNlcmlmIENhcHRpb24nLFxuICAgICdQYWNpZmljbycsXG4gICAgJ1BhZGF1aycsXG4gICAgJ1BhZHlha2tlIEV4cGFuZGVkIE9uZScsXG4gICAgJ1BhbGFucXVpbicsXG4gICAgJ1BhbGFucXVpbiBEYXJrJyxcbiAgICAnUGFsZXR0ZSBNb3NhaWMnLFxuICAgICdQYW5nb2xpbicsXG4gICAgJ1BhcHJpa2EnLFxuICAgICdQYXJpc2llbm5lJyxcbiAgICAnUGFzc2VybyBPbmUnLFxuICAgICdQYXNzaW9uIE9uZScsXG4gICAgJ1Bhc3Npb25zIENvbmZsaWN0JyxcbiAgICAnUGF0aHdheSBFeHRyZW1lJyxcbiAgICAnUGF0aHdheSBHb3RoaWMgT25lJyxcbiAgICAnUGF0cmljayBIYW5kJyxcbiAgICAnUGF0cmljayBIYW5kIFNDJyxcbiAgICAnUGF0dGF5YScsXG4gICAgJ1BhdHVhIE9uZScsXG4gICAgJ1BhdmFuYW0nLFxuICAgICdQYXl0b25lIE9uZScsXG4gICAgJ1BlZGRhbmEnLFxuICAgICdQZXJhbHRhJyxcbiAgICAnUGVybWFuZW50IE1hcmtlcicsXG4gICAgJ1BldGVtb3NzJyxcbiAgICAnUGV0aXQgRm9ybWFsIFNjcmlwdCcsXG4gICAgJ1BldHJvbmEnLFxuICAgICdQaGlsb3NvcGhlcicsXG4gICAgJ1BodWR1JyxcbiAgICAnUGlhenpvbGxhJyxcbiAgICAnUGllZHJhJyxcbiAgICAnUGlueW9uIFNjcmlwdCcsXG4gICAgJ1BpcmF0YSBPbmUnLFxuICAgICdQaXhlbGlmeSBTYW5zJyxcbiAgICAnUGxhc3RlcicsXG4gICAgJ1BsYXknLFxuICAgICdQbGF5YmFsbCcsXG4gICAgJ1BsYXlmYWlyJyxcbiAgICAnUGxheWZhaXIgRGlzcGxheScsXG4gICAgJ1BsYXlmYWlyIERpc3BsYXkgU0MnLFxuICAgICdQbGF5cGVuIFNhbnMnLFxuICAgICdQbHVzIEpha2FydGEgU2FucycsXG4gICAgJ1BvZGtvdmEnLFxuICAgICdQb2lyZXQgT25lJyxcbiAgICAnUG9sbGVyIE9uZScsXG4gICAgJ1BvbHRhd3NraSBOb3d5JyxcbiAgICAnUG9seScsXG4gICAgJ1BvbXBpZXJlJyxcbiAgICAnUG9udGFubyBTYW5zJyxcbiAgICAnUG9vciBTdG9yeScsXG4gICAgJ1BvcHBpbnMnLFxuICAgICdQb3J0IExsaWdhdCBTYW5zJyxcbiAgICAnUG9ydCBMbGlnYXQgU2xhYicsXG4gICAgJ1BvdHRhIE9uZScsXG4gICAgJ1ByYWdhdGkgTmFycm93JyxcbiAgICAnUHJhaXNlJyxcbiAgICAnUHJhdGEnLFxuICAgICdQcmVhaHZpaGVhcicsXG4gICAgJ1ByZXNzIFN0YXJ0IDJQJyxcbiAgICAnUHJpZGknLFxuICAgICdQcmluY2VzcyBTb2ZpYScsXG4gICAgJ1Byb2Npb25vJyxcbiAgICAnUHJvbXB0JyxcbiAgICAnUHJvc3RvIE9uZScsXG4gICAgJ1Byb3phIExpYnJlJyxcbiAgICAnUHVibGljIFNhbnMnLFxuICAgICdQdXBwaWVzIFBsYXknLFxuICAgICdQdXJpdGFuJyxcbiAgICAnUHVycGxlIFB1cnNlJyxcbiAgICAnUWFoaXJpJyxcbiAgICAnUXVhbmRvJyxcbiAgICAnUXVhbnRpY28nLFxuICAgICdRdWF0dHJvY2VudG8nLFxuICAgICdRdWF0dHJvY2VudG8gU2FucycsXG4gICAgJ1F1ZXN0cmlhbCcsXG4gICAgJ1F1aWNrc2FuZCcsXG4gICAgJ1F1aW50ZXNzZW50aWFsJyxcbiAgICAnUXdpZ2xleScsXG4gICAgJ1F3aXRjaGVyIEdyeXBlbicsXG4gICAgJ1JFTScsXG4gICAgJ1JhY2luZyBTYW5zIE9uZScsXG4gICAgJ1JhZGlvIENhbmFkYScsXG4gICAgJ1JhZGxleScsXG4gICAgJ1JhamRoYW5pJyxcbiAgICAnUmFra2FzJyxcbiAgICAnUmFsZXdheScsXG4gICAgJ1JhbGV3YXkgRG90cycsXG4gICAgJ1JhbWFiaGFkcmEnLFxuICAgICdSYW1hcmFqYScsXG4gICAgJ1JhbWJsYScsXG4gICAgJ1JhbW1ldHRvIE9uZScsXG4gICAgJ1JhbXBhcnQgT25lJyxcbiAgICAnUmFuY2hlcnMnLFxuICAgICdSYW5jaG8nLFxuICAgICdSYW5nYScsXG4gICAgJ1Jhc2EnLFxuICAgICdSYXRpb25hbGUnLFxuICAgICdSYXZpIFByYWthc2gnLFxuICAgICdSZWFkZXggUHJvJyxcbiAgICAnUmVjdXJzaXZlJyxcbiAgICAnUmVkIEhhdCBEaXNwbGF5JyxcbiAgICAnUmVkIEhhdCBNb25vJyxcbiAgICAnUmVkIEhhdCBUZXh0JyxcbiAgICAnUmVkIFJvc2UnLFxuICAgICdSZWRhY3RlZCcsXG4gICAgJ1JlZGFjdGVkIFNjcmlwdCcsXG4gICAgJ1JlZHJlc3NlZCcsXG4gICAgJ1JlZW0gS3VmaScsXG4gICAgJ1JlZW0gS3VmaSBGdW4nLFxuICAgICdSZWVtIEt1ZmkgSW5rJyxcbiAgICAnUmVlbmllIEJlYW5pZScsXG4gICAgJ1JlZ2dhZSBPbmUnLFxuICAgICdSZXZhbGlhJyxcbiAgICAnUmhvZGl1bSBMaWJyZScsXG4gICAgJ1JpYmV5ZScsXG4gICAgJ1JpYmV5ZSBNYXJyb3cnLFxuICAgICdSaWdodGVvdXMnLFxuICAgICdSaXNxdWUnLFxuICAgICdSb2FkIFJhZ2UnLFxuICAgICdSb2JvdG8nLFxuICAgICdSb2JvdG8gQ29uZGVuc2VkJyxcbiAgICAnUm9ib3RvIEZsZXgnLFxuICAgICdSb2JvdG8gTW9ubycsXG4gICAgJ1JvYm90byBTZXJpZicsXG4gICAgJ1JvYm90byBTbGFiJyxcbiAgICAnUm9jaGVzdGVyJyxcbiAgICAnUm9jayAzRCcsXG4gICAgJ1JvY2sgU2FsdCcsXG4gICAgJ1JvY2tuUm9sbCBPbmUnLFxuICAgICdSb2traXR0JyxcbiAgICAnUm9tYW5lc2NvJyxcbiAgICAnUm9wYSBTYW5zJyxcbiAgICAnUm9zYXJpbycsXG4gICAgJ1Jvc2FyaXZvJyxcbiAgICAnUm91Z2UgU2NyaXB0JyxcbiAgICAnUm93ZGllcycsXG4gICAgJ1JvemhhIE9uZScsXG4gICAgJ1J1YmlrJyxcbiAgICAnUnViaWsgODBzIEZhZGUnLFxuICAgICdSdWJpayBCZWFzdGx5JyxcbiAgICAnUnViaWsgQnViYmxlcycsXG4gICAgJ1J1YmlrIEJ1cm5lZCcsXG4gICAgJ1J1YmlrIERpcnQnLFxuICAgICdSdWJpayBEaXN0cmVzc2VkJyxcbiAgICAnUnViaWsgR2Vtc3RvbmVzJyxcbiAgICAnUnViaWsgR2xpdGNoJyxcbiAgICAnUnViaWsgSXNvJyxcbiAgICAnUnViaWsgTWFya2VyIEhhdGNoJyxcbiAgICAnUnViaWsgTWF6ZScsXG4gICAgJ1J1YmlrIE1pY3JvYmUnLFxuICAgICdSdWJpayBNb25vIE9uZScsXG4gICAgJ1J1YmlrIE1vb25yb2NrcycsXG4gICAgJ1J1YmlrIFBpeGVscycsXG4gICAgJ1J1YmlrIFB1ZGRsZXMnLFxuICAgICdSdWJpayBTcHJheSBQYWludCcsXG4gICAgJ1J1YmlrIFN0b3JtJyxcbiAgICAnUnViaWsgVmlueWwnLFxuICAgICdSdWJpayBXZXQgUGFpbnQnLFxuICAgICdSdWRhJyxcbiAgICAnUnVmaW5hJyxcbiAgICAnUnVnZSBCb29naWUnLFxuICAgICdSdWx1a28nLFxuICAgICdSdW0gUmFpc2luJyxcbiAgICAnUnVzbGFuIERpc3BsYXknLFxuICAgICdSdXNzbyBPbmUnLFxuICAgICdSdXRoaWUnLFxuICAgICdSdXd1ZHUnLFxuICAgICdSeWUnLFxuICAgICdTVElYIFR3byBUZXh0JyxcbiAgICAnU2FjcmFtZW50bycsXG4gICAgJ1NhaGl0eWEnLFxuICAgICdTYWlsJyxcbiAgICAnU2FpcmEnLFxuICAgICdTYWlyYSBDb25kZW5zZWQnLFxuICAgICdTYWlyYSBFeHRyYSBDb25kZW5zZWQnLFxuICAgICdTYWlyYSBTZW1pIENvbmRlbnNlZCcsXG4gICAgJ1NhaXJhIFN0ZW5jaWwgT25lJyxcbiAgICAnU2Fsc2EnLFxuICAgICdTYW5jaGV6JyxcbiAgICAnU2FuY3JlZWsnLFxuICAgICdTYW5zaXRhJyxcbiAgICAnU2Fuc2l0YSBTd2FzaGVkJyxcbiAgICAnU2FyYWJ1bicsXG4gICAgJ1NhcmFsYScsXG4gICAgJ1NhcmluYScsXG4gICAgJ1NhcnBhbmNoJyxcbiAgICAnU2Fzc3kgRnJhc3MnLFxuICAgICdTYXRpc2Z5JyxcbiAgICAnU2F3YXJhYmkgR290aGljJyxcbiAgICAnU2F3YXJhYmkgTWluY2hvJyxcbiAgICAnU2NhZGEnLFxuICAgICdTY2hlaGVyYXphZGUgTmV3JyxcbiAgICAnU2NoaWJzdGVkIEdyb3Rlc2snLFxuICAgICdTY2hvb2xiZWxsJyxcbiAgICAnU2NvcGUgT25lJyxcbiAgICAnU2Vhd2VlZCBTY3JpcHQnLFxuICAgICdTZWN1bGFyIE9uZScsXG4gICAgJ1NlZGd3aWNrIEF2ZScsXG4gICAgJ1NlZGd3aWNrIEF2ZSBEaXNwbGF5JyxcbiAgICAnU2VuJyxcbiAgICAnU2VuZCBGbG93ZXJzJyxcbiAgICAnU2V2aWxsYW5hJyxcbiAgICAnU2V5bW91ciBPbmUnLFxuICAgICdTaGFkb3dzIEludG8gTGlnaHQnLFxuICAgICdTaGFkb3dzIEludG8gTGlnaHQgVHdvJyxcbiAgICAnU2hhbGltYXInLFxuICAgICdTaGFudGVsbCBTYW5zJyxcbiAgICAnU2hhbnRpJyxcbiAgICAnU2hhcmUnLFxuICAgICdTaGFyZSBUZWNoJyxcbiAgICAnU2hhcmUgVGVjaCBNb25vJyxcbiAgICAnU2hpcHBvcmkgQW50aXF1ZScsXG4gICAgJ1NoaXBwb3JpIEFudGlxdWUgQjEnLFxuICAgICdTaGlwcG9yaSBNaW5jaG8nLFxuICAgICdTaGlwcG9yaSBNaW5jaG8gQjEnLFxuICAgICdTaGl6dXJ1JyxcbiAgICAnU2hvanVtYXJ1JyxcbiAgICAnU2hvcnQgU3RhY2snLFxuICAgICdTaHJpa2hhbmQnLFxuICAgICdTaWVtcmVhcCcsXG4gICAgJ1NpZ21hcicsXG4gICAgJ1NpZ21hciBPbmUnLFxuICAgICdTaWduaWthJyxcbiAgICAnU2lnbmlrYSBOZWdhdGl2ZScsXG4gICAgJ1NpbGtzY3JlZW4nLFxuICAgICdTaW1vbmV0dGEnLFxuICAgICdTaW5nbGUgRGF5JyxcbiAgICAnU2ludG9ueScsXG4gICAgJ1NpcmluIFN0ZW5jaWwnLFxuICAgICdTaXggQ2FwcycsXG4gICAgJ1NrcmFuamknLFxuICAgICdTbGFibyAxM3B4JyxcbiAgICAnU2xhYm8gMjdweCcsXG4gICAgJ1NsYWNrZXknLFxuICAgICdTbGFja3NpZGUgT25lJyxcbiAgICAnU21va3VtJyxcbiAgICAnU21vb2NoJyxcbiAgICAnU21vb2NoIFNhbnMnLFxuICAgICdTbXl0aGUnLFxuICAgICdTbmlnbGV0JyxcbiAgICAnU25pcHBldCcsXG4gICAgJ1Nub3didXJzdCBPbmUnLFxuICAgICdTb2ZhZGkgT25lJyxcbiAgICAnU29maWEnLFxuICAgICdTb2ZpYSBTYW5zJyxcbiAgICAnU29maWEgU2FucyBDb25kZW5zZWQnLFxuICAgICdTb2ZpYSBTYW5zIEV4dHJhIENvbmRlbnNlZCcsXG4gICAgJ1NvZmlhIFNhbnMgU2VtaSBDb25kZW5zZWQnLFxuICAgICdTb2xpdHJlbycsXG4gICAgJ1NvbHdheScsXG4gICAgJ1NvbWV0eXBlIE1vbm8nLFxuICAgICdTb25nIE15dW5nJyxcbiAgICAnU29ubycsXG4gICAgJ1NvbnNpZSBPbmUnLFxuICAgICdTb3JhJyxcbiAgICAnU29ydHMgTWlsbCBHb3VkeScsXG4gICAgJ1NvdXJjZSBDb2RlIFBybycsXG4gICAgJ1NvdXJjZSBTYW5zIDMnLFxuICAgICdTb3VyY2UgU2VyaWYgNCcsXG4gICAgJ1NwYWNlIEdyb3Rlc2snLFxuICAgICdTcGFjZSBNb25vJyxcbiAgICAnU3BlY2lhbCBFbGl0ZScsXG4gICAgJ1NwZWN0cmFsJyxcbiAgICAnU3BlY3RyYWwgU0MnLFxuICAgICdTcGljeSBSaWNlJyxcbiAgICAnU3Bpbm5ha2VyJyxcbiAgICAnU3BpcmF4JyxcbiAgICAnU3BsYXNoJyxcbiAgICAnU3BsaW5lIFNhbnMnLFxuICAgICdTcGxpbmUgU2FucyBNb25vJyxcbiAgICAnU3F1YWRhIE9uZScsXG4gICAgJ1NxdWFyZSBQZWcnLFxuICAgICdTcmVlIEtydXNobmFkZXZhcmF5YScsXG4gICAgJ1NyaXJhY2hhJyxcbiAgICAnU3Jpc2FrZGknLFxuICAgICdTdGFhdGxpY2hlcycsXG4gICAgJ1N0YWxlbWF0ZScsXG4gICAgJ1N0YWxpbmlzdCBPbmUnLFxuICAgICdTdGFyZG9zIFN0ZW5jaWwnLFxuICAgICdTdGljaycsXG4gICAgJ1N0aWNrIE5vIEJpbGxzJyxcbiAgICAnU3RpbnQgVWx0cmEgQ29uZGVuc2VkJyxcbiAgICAnU3RpbnQgVWx0cmEgRXhwYW5kZWQnLFxuICAgICdTdG9rZScsXG4gICAgJ1N0cmFpdCcsXG4gICAgJ1N0eWxlIFNjcmlwdCcsXG4gICAgJ1N0eWxpc2gnLFxuICAgICdTdWUgRWxsZW4gRnJhbmNpc2NvJyxcbiAgICAnU3VleiBPbmUnLFxuICAgICdTdWxwaHVyIFBvaW50JyxcbiAgICAnU3VtYW5hJyxcbiAgICAnU3VuZmxvd2VyJyxcbiAgICAnU3Vuc2hpbmV5JyxcbiAgICAnU3VwZXJtZXJjYWRvIE9uZScsXG4gICAgJ1N1cmEnLFxuICAgICdTdXJhbm5hJyxcbiAgICAnU3VyYXZhcmFtJyxcbiAgICAnU3V3YW5uYXBodW0nLFxuICAgICdTd2Fua3kgYW5kIE1vbyBNb28nLFxuICAgICdTeW5jb3BhdGUnLFxuICAgICdTeW5lJyxcbiAgICAnU3luZSBNb25vJyxcbiAgICAnU3luZSBUYWN0aWxlJyxcbiAgICAnVGFpIEhlcml0YWdlIFBybycsXG4gICAgJ1RhamF3YWwnLFxuICAgICdUYW5nZXJpbmUnLFxuICAgICdUYXBlc3RyeScsXG4gICAgJ1RhcHJvbScsXG4gICAgJ1RhdXJpJyxcbiAgICAnVGF2aXJhaicsXG4gICAgJ1Rla28nLFxuICAgICdUZWt0dXInLFxuICAgICdUZWxleCcsXG4gICAgJ1RlbmFsaSBSYW1ha3Jpc2huYScsXG4gICAgJ1Rlbm9yIFNhbnMnLFxuICAgICdUZXh0IE1lIE9uZScsXG4gICAgJ1RleHR1cmluYScsXG4gICAgJ1RoYXNhZGl0aCcsXG4gICAgJ1RoZSBHaXJsIE5leHQgRG9vcicsXG4gICAgJ1RoZSBOYXV0aWdhbCcsXG4gICAgJ1RpZW5uZScsXG4gICAgJ1RpbGxhbmEnLFxuICAgICdUaWx0IE5lb24nLFxuICAgICdUaWx0IFByaXNtJyxcbiAgICAnVGlsdCBXYXJwJyxcbiAgICAnVGltbWFuYScsXG4gICAgJ1Rpbm9zJyxcbiAgICAnVGlybyBCYW5nbGEnLFxuICAgICdUaXJvIERldmFuYWdhcmkgSGluZGknLFxuICAgICdUaXJvIERldmFuYWdhcmkgTWFyYXRoaScsXG4gICAgJ1Rpcm8gRGV2YW5hZ2FyaSBTYW5za3JpdCcsXG4gICAgJ1Rpcm8gR3VybXVraGknLFxuICAgICdUaXJvIEthbm5hZGEnLFxuICAgICdUaXJvIFRhbWlsJyxcbiAgICAnVGlybyBUZWx1Z3UnLFxuICAgICdUaXRhbiBPbmUnLFxuICAgICdUaXRpbGxpdW0gV2ViJyxcbiAgICAnVG9tb3Jyb3cnLFxuICAgICdUb3VybmV5JyxcbiAgICAnVHJhZGUgV2luZHMnLFxuICAgICdUcmFpbiBPbmUnLFxuICAgICdUcmlyb25nJyxcbiAgICAnVHJpc3BhY2UnLFxuICAgICdUcm9jY2hpJyxcbiAgICAnVHJvY2h1dCcsXG4gICAgJ1RydWN1bGVudGEnLFxuICAgICdUcnlra2VyJyxcbiAgICAnVHN1a2ltaSBSb3VuZGVkJyxcbiAgICAnVHVscGVuIE9uZScsXG4gICAgJ1R1cnJldCBSb2FkJyxcbiAgICAnVHdpbmtsZSBTdGFyJyxcbiAgICAnVWJ1bnR1JyxcbiAgICAnVWJ1bnR1IENvbmRlbnNlZCcsXG4gICAgJ1VidW50dSBNb25vJyxcbiAgICAnVWNoZW4nLFxuICAgICdVbHRyYScsXG4gICAgJ1VuYm91bmRlZCcsXG4gICAgJ1VuY2lhbCBBbnRpcXVhJyxcbiAgICAnVW5kZXJkb2cnLFxuICAgICdVbmljYSBPbmUnLFxuICAgICdVbmlmcmFrdHVyQ29vaycsXG4gICAgJ1VuaWZyYWt0dXJNYWd1bnRpYScsXG4gICAgJ1Vua2VtcHQnLFxuICAgICdVbmxvY2snLFxuICAgICdVbm5hJyxcbiAgICAnVXBkb2NrJyxcbiAgICAnVXJiYW5pc3QnLFxuICAgICdWVDMyMycsXG4gICAgJ1ZhbXBpcm8gT25lJyxcbiAgICAnVmFyZWxhJyxcbiAgICAnVmFyZWxhIFJvdW5kJyxcbiAgICAnVmFydGEnLFxuICAgICdWYXN0IFNoYWRvdycsXG4gICAgJ1ZhemlybWF0bicsXG4gICAgJ1Zlc3BlciBMaWJyZScsXG4gICAgJ1ZpYW9kYSBMaWJyZScsXG4gICAgJ1ZpYmVzJyxcbiAgICAnVmlidXInLFxuICAgICdWaWN0b3IgTW9ubycsXG4gICAgJ1ZpZGFsb2thJyxcbiAgICAnVmlnYScsXG4gICAgJ1ZpbmEgU2FucycsXG4gICAgJ1ZvY2VzJyxcbiAgICAnVm9sa2hvdicsXG4gICAgJ1ZvbGxrb3JuJyxcbiAgICAnVm9sbGtvcm4gU0MnLFxuICAgICdWb2x0YWlyZScsXG4gICAgJ1Z1amFoZGF5IFNjcmlwdCcsXG4gICAgJ1dhaXRpbmcgZm9yIHRoZSBTdW5yaXNlJyxcbiAgICAnV2FsbHBvZXQnLFxuICAgICdXYWx0ZXIgVHVybmNvYXQnLFxuICAgICdXYXJuZXMnLFxuICAgICdXYXRlciBCcnVzaCcsXG4gICAgJ1dhdGVyZmFsbCcsXG4gICAgJ1dhdmVmb250JyxcbiAgICAnV2VsbGZsZWV0JyxcbiAgICAnV2VuZHkgT25lJyxcbiAgICAnV2hpc3BlcicsXG4gICAgJ1dpbmRTb25nJyxcbiAgICAnV2lyZSBPbmUnLFxuICAgICdXaXggTWFkZWZvciBEaXNwbGF5JyxcbiAgICAnV2l4IE1hZGVmb3IgVGV4dCcsXG4gICAgJ1dvcmsgU2FucycsXG4gICAgJ1hhbmggTW9ubycsXG4gICAgJ1lhbGRldmknLFxuICAgICdZYW5vbmUgS2FmZmVlc2F0eicsXG4gICAgJ1lhbnRyYW1hbmF2JyxcbiAgICAnWWF0cmEgT25lJyxcbiAgICAnWWVsbG93dGFpbCcsXG4gICAgJ1llb24gU3VuZycsXG4gICAgJ1llc2V2YSBPbmUnLFxuICAgICdZZXN0ZXJ5ZWFyJyxcbiAgICAnWW9tb2dpJyxcbiAgICAnWW91bmcgU2VyaWYnLFxuICAgICdZcnNhJyxcbiAgICAnWXNhYmVhdScsXG4gICAgJ1lzYWJlYXUgSW5mYW50JyxcbiAgICAnWXNhYmVhdSBPZmZpY2UnLFxuICAgICdZc2FiZWF1IFNDJyxcbiAgICAnWXVqaSBCb2t1JyxcbiAgICAnWXVqaSBIZW50YWlnYW5hIEFrYXJpJyxcbiAgICAnWXVqaSBIZW50YWlnYW5hIEFrZWJvbm8nLFxuICAgICdZdWppIE1haScsXG4gICAgJ1l1amkgU3l1a3UnLFxuICAgICdZdXNlaSBNYWdpYycsXG4gICAgJ1pDT09MIEt1YWlMZScsXG4gICAgJ1pDT09MIFFpbmdLZSBIdWFuZ1lvdScsXG4gICAgJ1pDT09MIFhpYW9XZWknLFxuICAgICdaZW4gQW50aXF1ZScsXG4gICAgJ1plbiBBbnRpcXVlIFNvZnQnLFxuICAgICdaZW4gRG90cycsXG4gICAgJ1plbiBLYWt1IEdvdGhpYyBBbnRpcXVlJyxcbiAgICAnWmVuIEtha3UgR290aGljIE5ldycsXG4gICAgJ1plbiBLdXJlbmFpZG8nLFxuICAgICdaZW4gTG9vcCcsXG4gICAgJ1plbiBNYXJ1IEdvdGhpYycsXG4gICAgJ1plbiBPbGQgTWluY2hvJyxcbiAgICAnWmVuIFRva3lvIFpvbycsXG4gICAgJ1pleWFkYScsXG4gICAgJ1poaSBNYW5nIFhpbmcnLFxuICAgICdaaWxsYSBTbGFiJyxcbiAgICAnWmlsbGEgU2xhYiBIaWdobGlnaHQnLFxuICBdLm1hcCgoZikgPT4gW2YucmVwbGFjZUFsbCgnICcsICctJykudG9Mb3dlckNhc2UoKSwgZl0pXG4pO1xuXG4vLyBhbGwgY29tYmluYXRpb25zIG9mIGZvbnQgd2VpZ2h0cyBhbmQgc3R5bGVzXG4vLyBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL2ZvbnRzL2RvY3MvY3NzMiNhcGlfdXJsX3NwZWNpZmljYXRpb25cbmNvbnN0IHN0eWxlU3RyaW5nID1cbiAgJzAsMTAwOzAsMjAwOzAsMzAwOzAsNDAwOzAsNTAwOzAsNjAwOzAsNzAwOzAsODAwOzAsOTAwOzEsMTAwOzEsMjAwOzEsMzAwOzEsNDAwOzEsNTAwOzEsNjAwOzEsNzAwOzEsODAwOzEsOTAwJztcblxuY29uc3QgZ2V0Rm9udFVSTCA9IChmb250OiBzdHJpbmcpID0+IHtcbiAgcmV0dXJuIGBodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2NzczI/JHtgZmFtaWx5PSR7Zm9udC5yZXBsYWNlQWxsKCcgJywgJysnKX06aXRhbCx3Z2h0QCR7c3R5bGVTdHJpbmd9YH0mZGlzcGxheT1ibG9ja2A7XG59O1xuXG5jb25zdCBmb250QmxhY2tsaXN0ID0gbmV3IFNldChbXG4gICdzYW5zJyxcbiAgJ3NlcmlmJyxcbiAgJ21vbm8nLFxuICAndGhpbicsXG4gICdleHRyYWxpZ2h0JyxcbiAgJ2xpZ2h0JyxcbiAgJ25vcm1hbCcsXG4gICdtZWRpdW0nLFxuICAnc2VtaWJvbGQnLFxuICAnYm9sZCcsXG4gICdleHRyYWJvbGQnLFxuICAnYm9sZGVyJyxcbiAgJ2JsYWNrJyxcbl0pO1xuXG5jb25zdCBleHRyYWN0Rm9udHMgPSAoY29kZTogc3RyaW5nKSA9PiB7XG4gIC8vIFJlZ3VsYXIgZXhwcmVzc2lvbiB0byBtYXRjaCBjbGFzcyBuYW1lcyBzdGFydGluZyB3aXRoIFwiZm9udC1cIiB0aGF0IGFwcGVhclxuICAvLyBpbnNpZGUgY2xhc3MgYXR0cmlidXRlc1xuICBjb25zdCBbZm9udFJlZ2V4MSwgZm9udFJlZ2V4Ml0gPSBbL1xcYmZvbnQtKD86XFx3KikoPzotXFx3KikqXFxiL2csIC9cXGJmb250XFwtXFxbKD86W15cXF1dKylcXF0vZ107XG5cbiAgLy8gRmluZCBhbGwgY2xhc3MgYXR0cmlidXRlc1xuICBjb25zdCBmb250c1VzZWQgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICAvLyBGb3IgZWFjaCBjbGFzcyBhdHRyaWJ1dGUsIGV4dHJhY3QgdGhlIFwiZm9udC1cIiBwcmVmaXhlZCBjbGFzc2VzXG4gIGNvbnN0IGZvbnRNYXRjaGVzID0gY29kZS5tYXRjaChmb250UmVnZXgxKSA/PyBbXTtcbiAgZm9yIChjb25zdCBmb250Q2xhc3Mgb2YgZm9udE1hdGNoZXMpIHtcbiAgICBpZiAoIWZvbnRCbGFja2xpc3QuaGFzKGZvbnRDbGFzcykpIHtcbiAgICAgIGZvbnRzVXNlZC5hZGQoZm9udENsYXNzLnJlcGxhY2UoJ2ZvbnQtJywgJycpKTtcbiAgICB9XG4gIH1cbiAgY29uc3QgZmFtaWx5TWF0Y2hlcyA9IGNvZGUubWF0Y2goZm9udFJlZ2V4MikgPz8gW107XG4gIGZvciAoY29uc3QgZmFtaWx5IG9mIGZhbWlseU1hdGNoZXMpIHtcbiAgICAvLyBFeHRyYWN0IHRoZSBmb250IG5hbWUgZnJvbSB0aGUgbWF0Y2hcbiAgICBjb25zdCBmb250TmFtZSA9IGZhbWlseVxuICAgICAgLnJlcGxhY2VBbGwoJ2ZvbnQtWycsICcnKVxuICAgICAgLnJlcGxhY2VBbGwoJ10nLCAnJylcbiAgICAgIC5yZXBsYWNlQWxsKC9bJ1wiXS9nLCAnJylcbiAgICAgIC5yZXBsYWNlQWxsKC9fL2csICcgJyk7XG4gICAgaWYgKCFmb250QmxhY2tsaXN0Lmhhcyhmb250TmFtZSkpIHtcbiAgICAgIGZvbnRzVXNlZC5hZGQoZm9udE5hbWUudG9Mb3dlckNhc2UoKS5yZXBsYWNlQWxsKCcgJywgJy0nKSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgZm9udHMgPSBbLi4uZm9udHNVc2VkXVxuICAgIC5tYXAoKGYpID0+IEdPT0dMRV9GT05UUy5nZXQoZikgPz8gbnVsbClcbiAgICAuZmlsdGVyKChmKTogZiBpcyBzdHJpbmcgPT4gZiAhPT0gbnVsbCk7XG4gIHJldHVybiBmb250cy5zb3J0KChhLCBiKSA9PiBhLmxvY2FsZUNvbXBhcmUoYikpO1xufTtcblxuLy8gU3RvcmUgY29sbGVjdGVkIGZvbnQgbmFtZXNcbmNvbnN0IGNvbGxlY3RlZEZvbnRzID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbi8vIFJlc2V0IHRoZSBjb2xsZWN0ZWQgZm9udHNcbmNvbnN0IHJlc2V0ID0gKCkgPT4ge1xuICBjb2xsZWN0ZWRGb250cy5jbGVhcigpO1xufTtcbmNvbnN0IGNvbGxlY3RGb250cyA9IGFzeW5jICgpID0+IHtcbiAgY29uc3QgZmlsZXMgPSBhd2FpdCBmZygnc3JjLyoqLyoue2pzLHRzLGpzeCx0c3h9Jyk7XG4gIGNvbnN0IGFsbEZvbnRzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgZmlsZXMubWFwKGFzeW5jIChmaWxlKSA9PiB7XG4gICAgICBjb25zdCBjb2RlID0gYXdhaXQgZnMucHJvbWlzZXMucmVhZEZpbGUoZmlsZSwgJ3V0Zi04Jyk7XG4gICAgICByZXR1cm4gZXh0cmFjdEZvbnRzKGNvZGUpO1xuICAgIH0pXG4gICk7XG4gIGZvciAoY29uc3QgZm9udCBvZiBhbGxGb250cy5mbGF0KCkpIHtcbiAgICBjb2xsZWN0ZWRGb250cy5hZGQoZm9udCk7XG4gIH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkRm9udHNGcm9tVGFpbHdpbmRTb3VyY2UoKTogUGx1Z2luT3B0aW9uIHtcbiAgcmV0dXJuIFtcbiAgICB7XG4gICAgICBuYW1lOiAnbG9hZC1mb250cy1mcm9tLXRhaWx3aW5kLXNvdXJjZScsXG4gICAgICBlbmZvcmNlOiAncHJlJyxcbiAgICAgIGFzeW5jIGJ1aWxkU3RhcnQoKSB7XG4gICAgICAgIHJlc2V0KCk7XG4gICAgICAgIGF3YWl0IGNvbGxlY3RGb250cygpO1xuICAgICAgfSxcbiAgICAgIHRyYW5zZm9ybShjb2RlLCBpZCkge1xuICAgICAgICBpZiAoIS9cXC4oW2NtXT9banRdc3gpJC8udGVzdChpZCkpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmb250cyA9IGV4dHJhY3RGb250cyhjb2RlKTtcbiAgICAgICAgZm9yIChjb25zdCBmb250IG9mIGZvbnRzKSB7XG4gICAgICAgICAgY29sbGVjdGVkRm9udHMuYWRkKGZvbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdhZGQtZm9udHMtdG8tcm9vdCcsXG4gICAgICBlbmZvcmNlOiAncG9zdCcsXG4gICAgICByZXNvbHZlSWQoaWQpIHtcbiAgICAgICAgaWYgKGlkID09PSAndmlydHVhbDpsb2FkLWZvbnRzLmpzeCcpIHJldHVybiBpZDtcbiAgICAgIH0sXG4gICAgICBsb2FkKGlkKSB7XG4gICAgICAgIGlmIChpZCA9PT0gJ3ZpcnR1YWw6bG9hZC1mb250cy5qc3gnKSB7XG4gICAgICAgICAgY29uc3QgY29kZSA9IGBcbiAgICAgIGV4cG9ydCBmdW5jdGlvbiBMb2FkRm9udHMoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPD5cbiAgICAgICAgICAgICR7Wy4uLmNvbGxlY3RlZEZvbnRzXVxuICAgICAgICAgICAgICAubWFwKChmb250KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGA8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cIiR7Z2V0Rm9udFVSTChmb250KX1cIiAvPmA7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC5qb2luKCdcXG4nKX1cbiAgICAgICAgICA8Lz5cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGV4cG9ydCBkZWZhdWx0IExvYWRGb250cztcbiAgICBgO1xuICAgICAgICAgIHJldHVybiBjb2RlO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgYXN5bmMgaGFuZGxlSG90VXBkYXRlKHsgZmlsZSwgc2VydmVyLCBtb2R1bGVzIH0pIHtcbiAgICAgICAgY29uc3QgZm9udHNCZWZvcmUgPSBuZXcgU2V0KGNvbGxlY3RlZEZvbnRzKTtcbiAgICAgICAgYXdhaXQgY29sbGVjdEZvbnRzKCk7XG4gICAgICAgIGNvbnN0IGZvbnRzQWZ0ZXIgPSBuZXcgU2V0KGNvbGxlY3RlZEZvbnRzKTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGZvbnRzQmVmb3JlLnNpemUgPT09IGZvbnRzQWZ0ZXIuc2l6ZSAmJlxuICAgICAgICAgIFsuLi5mb250c0JlZm9yZV0uZXZlcnkoKGYpID0+IGZvbnRzQWZ0ZXIuaGFzKGYpKVxuICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmlydHVhbE1vZHVsZUlkID0gJ3ZpcnR1YWw6bG9hZC1mb250cy5qc3gnO1xuICAgICAgICBjb25zdCBtb2QgPSBzZXJ2ZXIubW9kdWxlR3JhcGguZ2V0TW9kdWxlQnlJZCh2aXJ0dWFsTW9kdWxlSWQpO1xuICAgICAgICBpZiAoIW1vZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzZXJ2ZXIucmVsb2FkTW9kdWxlKG1vZCk7XG4gICAgICB9LFxuICAgIH0sXG4gIF07XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3QvcGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9wbHVnaW5zL25leHRQdWJsaWNQcm9jZXNzRW52LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3QvcGx1Z2lucy9uZXh0UHVibGljUHJvY2Vzc0Vudi50c1wiO2ltcG9ydCB7IHR5cGUgUGx1Z2luLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XG5cbi8qKlxuICogTWFrZXMgYHByb2Nlc3MuZW52YCBzYWZlIG9uIHRoZSAqKmNsaWVudCoqIG9ubHkuXG4gKiAgIFx1MjAyMiBORVhUX1BVQkxJQ18qIGtleXMgZ2V0IHRoZWlyIGxpdGVyYWwgdmFsdWVzLlxuICogICBcdTIwMjIgRXZlcnkgb3RoZXIga2V5IHJldHVybnMgYHVuZGVmaW5lZGAuXG4gKiBTZXJ2ZXIgLyBTU1IgY29kZSBpcyB1bnRvdWNoZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuZXh0UHVibGljUHJvY2Vzc0VudigpOiBQbHVnaW4ge1xuICBjb25zdCBwdWJsaWNFbnYgPSBsb2FkRW52KFxuICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WID8/ICdkZXZlbG9wbWVudCcsXG4gICAgcHJvY2Vzcy5jd2QoKSxcbiAgICAnTkVYVF9QVUJMSUNfJyxcbiAgKTtcblxuICBjb25zdCBzdHViID0gYFxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gIGNvbnN0ICRwdWJsaWMgPSAke0pTT04uc3RyaW5naWZ5KHB1YmxpY0Vudil9O1xuICBnbG9iYWxUaGlzLnByb2Nlc3MgPz89IHt9O1xuICAvLyBQcmVzZXJ2ZSBhbnkgZW52IHZhcnMgc2V0IGJ5IG90aGVyIGxpYnJhcmllc1xuICBjb25zdCBiYXNlID0gZ2xvYmFsVGhpcy5wcm9jZXNzLmVudiA/PyB7fTtcbiAgZ2xvYmFsVGhpcy5wcm9jZXNzLmVudiA9IG5ldyBQcm94eShPYmplY3QuYXNzaWduKHt9LCAkcHVibGljLCBiYXNlKSwge1xuICAgIGdldCh0LCBwKSB7IHJldHVybiBwIGluIHQgPyB0W3BdIDogdW5kZWZpbmVkOyB9LFxuICAgIGhhcygpIHsgcmV0dXJuIHRydWU7IH1cbiAgfSk7XG59XG5gO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3ZpdGU6bmV4dC1wdWJsaWMtcHJvY2Vzcy1lbnYnLFxuICAgIGVuZm9yY2U6ICdwb3N0JyxcblxuICAgIC8qKiBJbmplY3QgdGhlIHN0dWIgYXQgdGhlIHRvcCBvZiBldmVyeSBKUy9UUyBtb2R1bGUgY29tcGlsZWQgZm9yIHRoZSBicm93c2VyLiAqL1xuICAgIHRyYW5zZm9ybShjb2RlLCBpZCwgb3B0cykge1xuICAgICAgaWYgKG9wdHM/LnNzcikgcmV0dXJuIG51bGw7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzZXJ2ZXIvU1NSIGJ1aWxkIFx1MjE5MiBsZWF2ZSB1bnRvdWNoZWRcbiAgICAgIGlmICghL1xcLltjbV0/W2p0XXN4PyQvLnRlc3QoaWQpKSByZXR1cm4gbnVsbDsgIC8vIGlnbm9yZSBub24tSlMgbW9kdWxlc1xuICAgICAgaWYgKGNvZGUuaW5jbHVkZXMoJ2dsb2JhbFRoaXMucHJvY2VzcyA/Pz0nKSkgcmV0dXJuIG51bGw7IC8vIGFscmVhZHkgaW5qZWN0ZWRcbiAgICAgIHJldHVybiB7IGNvZGU6IHN0dWIgKyBjb2RlLCBtYXA6IG51bGwgfTtcbiAgICB9LFxuICB9O1xufVxuXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3QvcGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9wbHVnaW5zL3Jlc3RhcnQudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9wbHVnaW5zL3Jlc3RhcnQudHNcIjtpbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHByb2Nlc3MgZnJvbSAnbm9kZTpwcm9jZXNzJztcbmltcG9ydCBtaWNyb21hdGNoIGZyb20gJ21pY3JvbWF0Y2gnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcblxuZXhwb3J0IGludGVyZmFjZSBWaXRlUGx1Z2luUmVzdGFydE9wdGlvbnMge1xuXHQvKipcblx0ICogRW5hYmxlIGdsb2Igc3VwcG9ydCBmb3Igd2F0Y2hlciAoaXQncyBkaXNhYmxlZCBieSBWaXRlLCBidXQgYWRkIHRoaXMgcGx1Z2luIHdpbGwgdHVybiBpdCBvbiBieSBkZWZhdWx0KVxuXHQgKlxuXHQgKiBAZGVmYXVsdCB0cnVlXG5cdCAqL1xuXHRnbG9iPzogYm9vbGVhbjtcblx0LyoqXG5cdCAqIEBkZWZhdWx0IDUwMFxuXHQgKi9cblx0ZGVsYXk/OiBudW1iZXI7XG5cdC8qKlxuXHQgKiBBcnJheSBvZiBmaWxlcyB0byB3YXRjaCwgY2hhbmdlcyB0byB0aG9zZSBmaWxlIHdpbGwgdHJpZ2dlciBhIHNlcnZlciByZXN0YXJ0XG5cdCAqL1xuXHRyZXN0YXJ0Pzogc3RyaW5nIHwgc3RyaW5nW107XG5cdC8qKlxuXHQgKiBBcnJheSBvZiBmaWxlcyB0byB3YXRjaCwgY2hhbmdlcyB0byB0aG9zZSBmaWxlIHdpbGwgdHJpZ2dlciBhIGNsaWVudCBmdWxsIHBhZ2UgcmVsb2FkXG5cdCAqL1xuXHRyZWxvYWQ/OiBzdHJpbmcgfCBzdHJpbmdbXTtcbn1cblxubGV0IGkgPSAwO1xuXG5mdW5jdGlvbiB0b0FycmF5PFQ+KGFycjogVCB8IFRbXSB8IHVuZGVmaW5lZCk6IFRbXSB7XG5cdGlmICghYXJyKSByZXR1cm4gW107XG5cdGlmIChBcnJheS5pc0FycmF5KGFycikpIHJldHVybiBhcnI7XG5cdHJldHVybiBbYXJyXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc3RhcnQob3B0aW9uczogVml0ZVBsdWdpblJlc3RhcnRPcHRpb25zID0ge30pOiBQbHVnaW4ge1xuXHRjb25zdCB7IGRlbGF5ID0gNTAwLCBnbG9iOiBlbmFibGVHbG9iID0gdHJ1ZSB9ID0gb3B0aW9ucztcblxuXHRsZXQgcm9vdCA9IHByb2Nlc3MuY3dkKCk7XG5cdGxldCByZWxvYWRHbG9iczogc3RyaW5nW10gPSBbXTtcblx0bGV0IHJlc3RhcnRHbG9iczogc3RyaW5nW10gPSBbXTtcblxuXHRsZXQgdGltZXJTdGF0ZSA9ICdyZWxvYWQnO1xuXHRsZXQgdGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgdW5kZWZpbmVkO1xuXG5cdGZ1bmN0aW9uIGNsZWFyKCkge1xuXHRcdGdsb2JhbFRoaXMuY2xlYXJUaW1lb3V0KHRpbWVyKTtcblx0fVxuXHRmdW5jdGlvbiBzY2hlZHVsZShmbjogKCkgPT4gdm9pZCkge1xuXHRcdGNsZWFyKCk7XG5cdFx0dGltZXIgPSBnbG9iYWxUaGlzLnNldFRpbWVvdXQoZm4sIGRlbGF5KTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0bmFtZTogYHZpdGUtcGx1Z2luLXJlc3RhcnQ6JHtpKyt9YCxcblx0XHRhcHBseTogJ3NlcnZlJyxcblx0XHRjb25maWcoYykge1xuXHRcdFx0aWYgKCFlbmFibGVHbG9iKSByZXR1cm47XG5cdFx0XHRpZiAoIWMuc2VydmVyKSBjLnNlcnZlciA9IHt9O1xuXHRcdFx0aWYgKCFjLnNlcnZlci53YXRjaCkgYy5zZXJ2ZXIud2F0Y2ggPSB7fTtcblx0XHR9LFxuXHRcdGNvbmZpZ1Jlc29sdmVkKGNvbmZpZykge1xuXHRcdFx0Ly8gZmFtb3VzIGxhc3Qgd29yZHMsIGJ1dCB0aGlzICphcHBlYXJzKiB0byBhbHdheXMgYmUgYW4gYWJzb2x1dGUgcGF0aFxuXHRcdFx0Ly8gd2l0aCBhbGwgc2xhc2hlcyBub3JtYWxpemVkIHRvIGZvcndhcmQgc2xhc2hlcyBgL2AuIHRoaXMgaXMgY29tcGF0aWJsZVxuXHRcdFx0Ly8gd2l0aCBwYXRoLnBvc2l4LmpvaW4sIHNvIHdlIGNhbiB1c2UgaXQgdG8gbWFrZSBhbiBhYnNvbHV0ZSBwYXRoIGdsb2Jcblx0XHRcdHJvb3QgPSBjb25maWcucm9vdDtcblxuXHRcdFx0cmVzdGFydEdsb2JzID0gdG9BcnJheShvcHRpb25zLnJlc3RhcnQpLm1hcCgoaSkgPT5cblx0XHRcdFx0cGF0aC5wb3NpeC5qb2luKHJvb3QsIGkpXG5cdFx0XHQpO1xuXHRcdFx0cmVsb2FkR2xvYnMgPSB0b0FycmF5KG9wdGlvbnMucmVsb2FkKS5tYXAoKGkpID0+XG5cdFx0XHRcdHBhdGgucG9zaXguam9pbihyb290LCBpKVxuXHRcdFx0KTtcblx0XHR9LFxuXHRcdGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcblx0XHRcdHNlcnZlci53YXRjaGVyLmFkZChbLi4ucmVzdGFydEdsb2JzLCAuLi5yZWxvYWRHbG9ic10pO1xuXHRcdFx0c2VydmVyLndhdGNoZXIub24oJ2FkZCcsIGhhbmRsZUZpbGVDaGFuZ2UpO1xuXHRcdFx0c2VydmVyLndhdGNoZXIub24oJ3VubGluaycsIGhhbmRsZUZpbGVDaGFuZ2UpO1xuXG5cdFx0XHRmdW5jdGlvbiBoYW5kbGVGaWxlQ2hhbmdlKGZpbGU6IHN0cmluZykge1xuXHRcdFx0XHRpZiAobWljcm9tYXRjaC5pc01hdGNoKGZpbGUsIHJlc3RhcnRHbG9icykpIHtcblx0XHRcdFx0XHR0aW1lclN0YXRlID0gJ3Jlc3RhcnQnO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCdGaWxlIGNoYW5nZWQsIHNjaGVkdWxpbmcgcmVzdGFydDonLCBmaWxlKTtcblx0XHRcdFx0XHRzY2hlZHVsZSgoKSA9PiB7XG5cdFx0XHRcdFx0XHRzZXJ2ZXIucmVzdGFydCgpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRcdG1pY3JvbWF0Y2guaXNNYXRjaChmaWxlLCByZWxvYWRHbG9icykgJiZcblx0XHRcdFx0XHR0aW1lclN0YXRlICE9PSAncmVzdGFydCdcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0dGltZXJTdGF0ZSA9ICdyZWxvYWQnO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCdGaWxlIGNoYW5nZWQsIHNjaGVkdWxpbmcgcmVsb2FkOicsIGZpbGUpO1xuXHRcdFx0XHRcdHNjaGVkdWxlKCgpID0+IHtcblx0XHRcdFx0XHRcdHNlcnZlci53cy5zZW5kKHsgdHlwZTogJ2Z1bGwtcmVsb2FkJyB9KTtcblx0XHRcdFx0XHRcdHRpbWVyU3RhdGUgPSAnJztcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cdH07XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3QvcGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9wbHVnaW5zL3Jlc3RhcnRFbnZGaWxlQ2hhbmdlLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3QvcGx1Z2lucy9yZXN0YXJ0RW52RmlsZUNoYW5nZS50c1wiO2ltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ25vZGU6ZnMnO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiByZXN0YXJ0RW52RmlsZUNoYW5nZSgpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICd3YXRjaC1lbnYtYW5kLWV4aXQnLFxuICAgIGNvbmZpZyhjb25maWcsIGVudikge1xuICAgICAgY29uc3Qgcm9vdCA9IGNvbmZpZy5yb290IHx8IHByb2Nlc3MuY3dkKCk7XG4gICAgICBjb25zdCBtb2RlID0gZW52Lm1vZGUgfHwgJ2RldmVsb3BtZW50JztcblxuICAgICAgY29uc3QgZmlsZXNUb1dhdGNoID0gW1xuICAgICAgICAnLmVudicsXG4gICAgICAgICcuZW52LmxvY2FsJyxcbiAgICAgICAgYC5lbnYuJHttb2RlfWAsXG4gICAgICAgIGAuZW52LiR7bW9kZX0ubG9jYWxgLFxuICAgICAgXVxuICAgICAgICAubWFwKChmKSA9PiBwYXRoLnJlc29sdmUocm9vdCwgZikpXG4gICAgICAgIC5maWx0ZXIoKGZpbGUpID0+IGZzLmV4aXN0c1N5bmMoZmlsZSkpO1xuXG4gICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXNUb1dhdGNoKSB7XG4gICAgICAgIGZzLndhdGNoKGZpbGUsIHsgcGVyc2lzdGVudDogZmFsc2UgfSwgKCkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBbdml0ZV0gRGV0ZWN0ZWQgY2hhbmdlIGluICR7cGF0aC5iYXNlbmFtZShmaWxlKX0uIEV4aXRpbmcgZm9yIHJlc3RhcnQuLi5gKTtcbiAgICAgICAgICBwcm9jZXNzLmV4aXQoMCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gIH07XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLE9BQU9BLFdBQVU7QUFDMU8sU0FBUyxtQkFBbUI7QUFDNUIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBT0MsWUFBVztBQUNsQixPQUFPLG1CQUFtQjs7O0FDSnlOLFlBQVksV0FBVztBQU0xUSxTQUFTLGtCQUFrQjtBQUMzQixTQUFTLE1BQU0sTUFBYyxLQUFvQztBQUMvRCxTQUFPLFVBQVUsV0FBVyxNQUFNLEVBQy9CLE9BQU8sR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUUsRUFDdkMsT0FBTyxLQUFLLEVBQ1osTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNoQjtBQUtBLElBQU0sVUFBVSxFQUFFLFNBQVMsQ0FBQyxFQUFzQztBQUVsRSxJQUFNLHFCQUNKLENBQUMsRUFBRSxTQUFTLE1BQ1osQ0FBQyxRQUE2QjtBQUM1QixRQUFNLEVBQUUsT0FBTyxFQUFFLElBQUk7QUFFckIsU0FBTztBQUFBLElBQ0wsU0FBUztBQUFBLE1BQ1AsV0FBV0MsT0FBNEI7QUFDckMsY0FBTSxVQUFVQSxNQUFLLEtBQUs7QUFHMUIsWUFBSSxDQUFDLEVBQUUsZ0JBQWdCLFFBQVEsSUFBSSxFQUFHO0FBQ3RDLGNBQU0sVUFBVSxRQUFRLEtBQUs7QUFDN0IsWUFBSSxZQUFZLFFBQVEsWUFBWSxFQUFHO0FBQ3ZDLFlBQ0U7QUFBQSxVQUNFO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNB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QSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0YsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsV0FBVyxLQUFLLEdBQUcsRUFBRSxZQUFZLEdBQUcsQ0FBQyxDQUFDO0FBQ3hEO0FBSUEsSUFBTSxjQUNKO0FBRUYsSUFBTSxhQUFhLENBQUMsU0FBaUI7QUFDbkMsU0FBTyxxQ0FBcUMsVUFBVSxLQUFLLFdBQVcsS0FBSyxHQUFHLENBQUMsY0FBYyxXQUFXLEVBQUU7QUFDNUc7QUFFQSxJQUFNLGdCQUFnQixvQkFBSSxJQUFJO0FBQUEsRUFDNUI7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRixDQUFDO0FBRUQsSUFBTSxlQUFlLENBQUMsU0FBaUI7QUFHckMsUUFBTSxDQUFDLFlBQVksVUFBVSxJQUFJLENBQUMsOEJBQThCLHlCQUF5QjtBQUd6RixRQUFNLFlBQVksb0JBQUksSUFBWTtBQUdsQyxRQUFNLGNBQWMsS0FBSyxNQUFNLFVBQVUsS0FBSyxDQUFDO0FBQy9DLGFBQVcsYUFBYSxhQUFhO0FBQ25DLFFBQUksQ0FBQyxjQUFjLElBQUksU0FBUyxHQUFHO0FBQ2pDLGdCQUFVLElBQUksVUFBVSxRQUFRLFNBQVMsRUFBRSxDQUFDO0FBQUEsSUFDOUM7QUFBQSxFQUNGO0FBQ0EsUUFBTSxnQkFBZ0IsS0FBSyxNQUFNLFVBQVUsS0FBSyxDQUFDO0FBQ2pELGFBQVcsVUFBVSxlQUFlO0FBRWxDLFVBQU0sV0FBVyxPQUNkLFdBQVcsVUFBVSxFQUFFLEVBQ3ZCLFdBQVcsS0FBSyxFQUFFLEVBQ2xCLFdBQVcsU0FBUyxFQUFFLEVBQ3RCLFdBQVcsTUFBTSxHQUFHO0FBQ3ZCLFFBQUksQ0FBQyxjQUFjLElBQUksUUFBUSxHQUFHO0FBQ2hDLGdCQUFVLElBQUksU0FBUyxZQUFZLEVBQUUsV0FBVyxLQUFLLEdBQUcsQ0FBQztBQUFBLElBQzNEO0FBQUEsRUFDRjtBQUVBLFFBQU0sUUFBUSxDQUFDLEdBQUcsU0FBUyxFQUN4QixJQUFJLENBQUMsTUFBTSxhQUFhLElBQUksQ0FBQyxLQUFLLElBQUksRUFDdEMsT0FBTyxDQUFDLE1BQW1CLE1BQU0sSUFBSTtBQUN4QyxTQUFPLE1BQU0sS0FBSyxDQUFDLEdBQUcsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQ2hEO0FBR0EsSUFBTSxpQkFBaUIsb0JBQUksSUFBWTtBQUd2QyxJQUFNLFFBQVEsTUFBTTtBQUNsQixpQkFBZSxNQUFNO0FBQ3ZCO0FBQ0EsSUFBTSxlQUFlLFlBQVk7QUFDL0IsUUFBTSxRQUFRLE1BQU0sR0FBRywwQkFBMEI7QUFDakQsUUFBTSxXQUFXLE1BQU0sUUFBUTtBQUFBLElBQzdCLE1BQU0sSUFBSSxPQUFPLFNBQVM7QUFDeEIsWUFBTSxPQUFPLE1BQU1DLElBQUcsU0FBUyxTQUFTLE1BQU0sT0FBTztBQUNyRCxhQUFPLGFBQWEsSUFBSTtBQUFBLElBQzFCLENBQUM7QUFBQSxFQUNIO0FBQ0EsYUFBVyxRQUFRLFNBQVMsS0FBSyxHQUFHO0FBQ2xDLG1CQUFlLElBQUksSUFBSTtBQUFBLEVBQ3pCO0FBQ0Y7QUFFTyxTQUFTLDhCQUE0QztBQUMxRCxTQUFPO0FBQUEsSUFDTDtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sU0FBUztBQUFBLE1BQ1QsTUFBTSxhQUFhO0FBQ2pCLGNBQU07QUFDTixjQUFNLGFBQWE7QUFBQSxNQUNyQjtBQUFBLE1BQ0EsVUFBVSxNQUFNLElBQUk7QUFDbEIsWUFBSSxDQUFDLG1CQUFtQixLQUFLLEVBQUUsR0FBRztBQUNoQyxpQkFBTztBQUFBLFFBQ1Q7QUFDQSxjQUFNLFFBQVEsYUFBYSxJQUFJO0FBQy9CLG1CQUFXLFFBQVEsT0FBTztBQUN4Qix5QkFBZSxJQUFJLElBQUk7QUFBQSxRQUN6QjtBQUNBLGVBQU87QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLFNBQVM7QUFBQSxNQUNULFVBQVUsSUFBSTtBQUNaLFlBQUksT0FBTyx5QkFBMEIsUUFBTztBQUFBLE1BQzlDO0FBQUEsTUFDQSxLQUFLLElBQUk7QUFDUCxZQUFJLE9BQU8sMEJBQTBCO0FBQ25DLGdCQUFNLE9BQU87QUFBQTtBQUFBO0FBQUE7QUFBQSxjQUlULENBQUMsR0FBRyxjQUFjLEVBQ2pCLElBQUksQ0FBQyxTQUFTO0FBQ2IsbUJBQU8sZ0NBQWdDLFdBQVcsSUFBSSxDQUFDO0FBQUEsVUFDekQsQ0FBQyxFQUNBLEtBQUssSUFBSSxDQUFDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQU1mLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFBQSxNQUNBLE1BQU0sZ0JBQWdCLEVBQUUsTUFBTSxRQUFRLFFBQVEsR0FBRztBQUMvQyxjQUFNLGNBQWMsSUFBSSxJQUFJLGNBQWM7QUFDMUMsY0FBTSxhQUFhO0FBQ25CLGNBQU0sYUFBYSxJQUFJLElBQUksY0FBYztBQUN6QyxZQUNFLFlBQVksU0FBUyxXQUFXLFFBQ2hDLENBQUMsR0FBRyxXQUFXLEVBQUUsTUFBTSxDQUFDLE1BQU0sV0FBVyxJQUFJLENBQUMsQ0FBQyxHQUMvQztBQUNBO0FBQUEsUUFDRjtBQUNBLGNBQU0sa0JBQWtCO0FBQ3hCLGNBQU0sTUFBTSxPQUFPLFlBQVksY0FBYyxlQUFlO0FBQzVELFlBQUksQ0FBQyxLQUFLO0FBQ1I7QUFBQSxRQUNGO0FBQ0EsZUFBTyxhQUFhLEdBQUc7QUFBQSxNQUN6QjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7OztBQ2pzRG1RLFNBQXNCLGVBQWU7QUFRalMsU0FBUyx1QkFBK0I7QUFDN0MsUUFBTSxZQUFZO0FBQUEsSUFDaEIsUUFBUSxJQUFJLFlBQVk7QUFBQSxJQUN4QixRQUFRLElBQUk7QUFBQSxJQUNaO0FBQUEsRUFDRjtBQUVBLFFBQU0sT0FBTztBQUFBO0FBQUEsb0JBRUssS0FBSyxVQUFVLFNBQVMsQ0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVczQyxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUE7QUFBQSxJQUdULFVBQVUsTUFBTSxJQUFJLE1BQU07QUFDeEIsVUFBSSxNQUFNLElBQUssUUFBTztBQUN0QixVQUFJLENBQUMsa0JBQWtCLEtBQUssRUFBRSxFQUFHLFFBQU87QUFDeEMsVUFBSSxLQUFLLFNBQVMsd0JBQXdCLEVBQUcsUUFBTztBQUNwRCxhQUFPLEVBQUUsTUFBTSxPQUFPLE1BQU0sS0FBSyxLQUFLO0FBQUEsSUFDeEM7QUFBQSxFQUNGO0FBQ0Y7OztBQ3hDeU8sT0FBT0MsV0FBVTtBQUMxUCxPQUFPQyxjQUFhO0FBQ3BCLE9BQU8sZ0JBQWdCO0FBd0J2QixJQUFJLElBQUk7QUFFUixTQUFTLFFBQVcsS0FBK0I7QUFDbEQsTUFBSSxDQUFDLElBQUssUUFBTyxDQUFDO0FBQ2xCLE1BQUksTUFBTSxRQUFRLEdBQUcsRUFBRyxRQUFPO0FBQy9CLFNBQU8sQ0FBQyxHQUFHO0FBQ1o7QUFFTyxTQUFTLFFBQVEsVUFBb0MsQ0FBQyxHQUFXO0FBQ3ZFLFFBQU0sRUFBRSxRQUFRLEtBQUssTUFBTSxhQUFhLEtBQUssSUFBSTtBQUVqRCxNQUFJLE9BQU9DLFNBQVEsSUFBSTtBQUN2QixNQUFJLGNBQXdCLENBQUM7QUFDN0IsTUFBSSxlQUF5QixDQUFDO0FBRTlCLE1BQUksYUFBYTtBQUNqQixNQUFJO0FBRUosV0FBUyxRQUFRO0FBQ2hCLGVBQVcsYUFBYSxLQUFLO0FBQUEsRUFDOUI7QUFDQSxXQUFTLFNBQVMsSUFBZ0I7QUFDakMsVUFBTTtBQUNOLFlBQVEsV0FBVyxXQUFXLElBQUksS0FBSztBQUFBLEVBQ3hDO0FBRUEsU0FBTztBQUFBLElBQ04sTUFBTSx1QkFBdUIsR0FBRztBQUFBLElBQ2hDLE9BQU87QUFBQSxJQUNQLE9BQU8sR0FBRztBQUNULFVBQUksQ0FBQyxXQUFZO0FBQ2pCLFVBQUksQ0FBQyxFQUFFLE9BQVEsR0FBRSxTQUFTLENBQUM7QUFDM0IsVUFBSSxDQUFDLEVBQUUsT0FBTyxNQUFPLEdBQUUsT0FBTyxRQUFRLENBQUM7QUFBQSxJQUN4QztBQUFBLElBQ0EsZUFBZSxRQUFRO0FBSXRCLGFBQU8sT0FBTztBQUVkLHFCQUFlLFFBQVEsUUFBUSxPQUFPLEVBQUU7QUFBQSxRQUFJLENBQUNDLE9BQzVDQyxNQUFLLE1BQU0sS0FBSyxNQUFNRCxFQUFDO0FBQUEsTUFDeEI7QUFDQSxvQkFBYyxRQUFRLFFBQVEsTUFBTSxFQUFFO0FBQUEsUUFBSSxDQUFDQSxPQUMxQ0MsTUFBSyxNQUFNLEtBQUssTUFBTUQsRUFBQztBQUFBLE1BQ3hCO0FBQUEsSUFDRDtBQUFBLElBQ0EsZ0JBQWdCLFFBQVE7QUFDdkIsYUFBTyxRQUFRLElBQUksQ0FBQyxHQUFHLGNBQWMsR0FBRyxXQUFXLENBQUM7QUFDcEQsYUFBTyxRQUFRLEdBQUcsT0FBTyxnQkFBZ0I7QUFDekMsYUFBTyxRQUFRLEdBQUcsVUFBVSxnQkFBZ0I7QUFFNUMsZUFBUyxpQkFBaUIsTUFBYztBQUN2QyxZQUFJLFdBQVcsUUFBUSxNQUFNLFlBQVksR0FBRztBQUMzQyx1QkFBYTtBQUNiLGtCQUFRLElBQUkscUNBQXFDLElBQUk7QUFDckQsbUJBQVMsTUFBTTtBQUNkLG1CQUFPLFFBQVE7QUFBQSxVQUNoQixDQUFDO0FBQUEsUUFDRixXQUNDLFdBQVcsUUFBUSxNQUFNLFdBQVcsS0FDcEMsZUFBZSxXQUNkO0FBQ0QsdUJBQWE7QUFDYixrQkFBUSxJQUFJLG9DQUFvQyxJQUFJO0FBQ3BELG1CQUFTLE1BQU07QUFDZCxtQkFBTyxHQUFHLEtBQUssRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUN0Qyx5QkFBYTtBQUFBLFVBQ2QsQ0FBQztBQUFBLFFBQ0Y7QUFBQSxNQUNEO0FBQUEsSUFDRDtBQUFBLEVBQ0Q7QUFDRDs7O0FDbEdBLE9BQU9FLFdBQVU7QUFDakIsT0FBT0MsU0FBUTtBQUdSLFNBQVMsdUJBQStCO0FBQzdDLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLE9BQU8sUUFBUSxLQUFLO0FBQ2xCLFlBQU0sT0FBTyxPQUFPLFFBQVEsUUFBUSxJQUFJO0FBQ3hDLFlBQU0sT0FBTyxJQUFJLFFBQVE7QUFFekIsWUFBTSxlQUFlO0FBQUEsUUFDbkI7QUFBQSxRQUNBO0FBQUEsUUFDQSxRQUFRLElBQUk7QUFBQSxRQUNaLFFBQVEsSUFBSTtBQUFBLE1BQ2QsRUFDRyxJQUFJLENBQUMsTUFBTUMsTUFBSyxRQUFRLE1BQU0sQ0FBQyxDQUFDLEVBQ2hDLE9BQU8sQ0FBQyxTQUFTQyxJQUFHLFdBQVcsSUFBSSxDQUFDO0FBRXZDLGlCQUFXLFFBQVEsY0FBYztBQUMvQixRQUFBQSxJQUFHLE1BQU0sTUFBTSxFQUFFLFlBQVksTUFBTSxHQUFHLE1BQU07QUFDMUMsa0JBQVEsSUFBSSw2QkFBNkJELE1BQUssU0FBUyxJQUFJLENBQUMsMEJBQTBCO0FBQ3RGLGtCQUFRLEtBQUssQ0FBQztBQUFBLFFBQ2hCLENBQUM7QUFBQSxNQUNIO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjs7O0FSN0JBLElBQU1FLG9DQUFtQztBQWN6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQTtBQUFBLEVBRTFCLFdBQVc7QUFBQSxFQUNYLGNBQWM7QUFBQTtBQUFBO0FBQUEsSUFHWixTQUFTLENBQUMsYUFBYSxjQUFjO0FBQUEsSUFDckMsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFVBQVU7QUFBQSxFQUNWLFNBQVM7QUFBQSxJQUNQLHFCQUFxQjtBQUFBLElBQ3JCLHFCQUFxQjtBQUFBO0FBQUEsSUFFckJDLE9BQU07QUFBQSxNQUNKLFNBQVMsQ0FBQywwQkFBMEI7QUFBQTtBQUFBLE1BQ3BDLFNBQVM7QUFBQTtBQUFBLE1BQ1QsYUFBYTtBQUFBLFFBQ1gsU0FBUztBQUFBO0FBQUEsUUFDVCxZQUFZO0FBQUEsUUFDWixTQUFTLENBQUMsa0JBQWtCO0FBQUEsTUFDOUI7QUFBQSxJQUNGLENBQUM7QUFBQSxJQUNELFFBQVE7QUFBQSxNQUNOLFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxnQkFBZ0I7QUFBQSxJQUNoQiw0QkFBNEI7QUFBQSxJQUM1QixhQUFhO0FBQUEsSUFDYixZQUFZO0FBQUEsSUFDWixjQUFjO0FBQUEsSUFDZCxRQUFRO0FBQUEsSUFDUixvQkFBb0I7QUFBQSxFQUN0QjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsY0FBYztBQUFBLE1BQ2QsUUFBUUMsTUFBSyxRQUFRQyxtQ0FBVyx1QkFBdUI7QUFBQSxNQUN2RCxzQkFBc0I7QUFBQSxNQUN0QixnQkFBZ0JELE1BQUssUUFBUUMsbUNBQVcsNkJBQTZCO0FBQUEsTUFDckUsS0FBS0QsTUFBSyxRQUFRQyxtQ0FBVyxLQUFLO0FBQUEsSUFDcEM7QUFBQSxJQUNBLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFBQSxFQUMvQjtBQUFBLEVBQ0EsYUFBYTtBQUFBLEVBQ2IsUUFBUTtBQUFBLElBQ04sY0FBYztBQUFBLElBQ2QsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sS0FBSztBQUFBLE1BQ0gsU0FBUztBQUFBLElBQ1g7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLGFBQWEsQ0FBQyxrQkFBa0Isc0JBQXNCLHFCQUFxQjtBQUFBLElBQzdFO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbInBhdGgiLCAiYmFiZWwiLCAicGF0aCIsICJwYXRoIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lIiwgInBhdGgiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUiLCAiaSIsICJmcyIsICJmcyIsICJwYXRoIiwgInByb2Nlc3MiLCAicHJvY2VzcyIsICJpIiwgInBhdGgiLCAicGF0aCIsICJmcyIsICJwYXRoIiwgImZzIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lIiwgImJhYmVsIiwgInBhdGgiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUiXQp9Cg==
