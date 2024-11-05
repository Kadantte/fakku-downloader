import type { PageData } from ".";
import type { Mapping } from "./types";

const _0x5d1006 = function () {
  var _0x2f91fe = 0xefc8249d;
  return function (_0x4df4a9) {
    if (_0x4df4a9) {
      _0x4df4a9 = _0x4df4a9["toString"]();
      for (var _0x359cb4 = 0x0; _0x359cb4 < _0x4df4a9["length"]; _0x359cb4++) {
        var _0x1bc166 =
          0.02519603282416938 *
          (_0x2f91fe += _0x4df4a9["charCodeAt"](_0x359cb4));
        (_0x1bc166 -= _0x2f91fe = _0x1bc166 >>> 0x0),
          (_0x2f91fe = (_0x1bc166 *= _0x2f91fe) >>> 0x0),
          (_0x2f91fe += 0x100000000 * (_0x1bc166 -= _0x2f91fe));
      }
      return 2.3283064365386963e-10 * (_0x2f91fe >>> 0x0);
    }
    _0x2f91fe = 0xefc8249d;
  };
};

function _0x429f88(_0x574239, _0x317a7a) {
  var _0x4f7cc4 = [],
    _0x91d6c0 = [];
  return (
    null == _0x317a7a &&
      (_0x317a7a = function (_0x171abd, _0x164085) {
        return _0x4f7cc4[0x0] === _0x164085
          ? "[Circular ~]"
          : "[Circular\x20~." +
              _0x91d6c0["slice"](0x0, _0x4f7cc4["indexOf"](_0x164085))["join"](
                "."
              ) +
              "]";
      }),
    function (_0x2113ee, _0xdb0a61) {
      if (_0x4f7cc4["length"] > 0x0) {
        var _0x16119d = _0x4f7cc4["indexOf"](this);
        ~_0x16119d
          ? _0x4f7cc4["splice"](_0x16119d + 0x1)
          : _0x4f7cc4["push"](this),
          ~_0x16119d
            ? _0x91d6c0["splice"](_0x16119d, 0x1 / 0x0, _0x2113ee)
            : _0x91d6c0["push"](_0x2113ee),
          ~_0x4f7cc4["indexOf"](_0xdb0a61) &&
            (_0xdb0a61 = _0x317a7a["call"](this, _0x2113ee, _0xdb0a61));
      } else _0x4f7cc4["push"](_0xdb0a61);
      return null == _0x574239
        ? _0xdb0a61
        : _0x574239["call"](this, _0x2113ee, _0xdb0a61);
    }
  );
}

function _0x3a53ee(_0x2a6560, _0x44d197, _0x46ed5c, _0x2b7bca) {
  return JSON["parse"](_0x2a6560, _0x429f88(_0x44d197, _0x2b7bca), _0x46ed5c);
}

const _0x23aab7 = function (_0xd1d5) {
  return (function () {
    var _0x19baac,
      _0x24c6ef,
      _0x5189eb = 0x30,
      _0x34d74b = 0x1,
      _0x1282de = _0x5189eb,
      _0x5eacfd = new Array(_0x5189eb),
      _0x5afbb2 = 0x0,
      _0x5f4fbd = new _0x5d1006();
    for (_0x19baac = 0x0; _0x19baac < _0x5189eb; _0x19baac++)
      _0x5eacfd[_0x19baac] = _0x5f4fbd(Math["random"]());
    var _0x196513 = function () {
        ++_0x1282de >= _0x5189eb && (_0x1282de = 0x0);
        var _0x4b66e2 =
          0x1afd9f * _0x5eacfd[_0x1282de] + 2.3283064365386963e-10 * _0x34d74b;
        return (_0x5eacfd[_0x1282de] =
          _0x4b66e2 - (_0x34d74b = 0x0 | _0x4b66e2));
      },
      _0x57972f = function (_0x2f81e8) {
        return Math["floor"](
          _0x2f81e8 *
            (_0x196513() +
              1.1102230246251565e-16 * ((0x200000 * _0x196513()) | 0x0))
        );
      };
    _0x57972f["string"] = function (_0xd5ff3b) {
      var _0x5a6573,
        _0xba2a01 = "";
      for (_0x5a6573 = 0x0; _0x5a6573 < _0xd5ff3b; _0x5a6573++)
        _0xba2a01 += String["fromCharCode"](0x21 + _0x57972f(0x5e));
      return _0xba2a01;
    };
    var _0x17463d = function () {
      var _0x18e103 = Array["prototype"]["slice"]["call"](arguments);
      for (_0x19baac = 0x0; _0x19baac < _0x18e103["length"]; _0x19baac++)
        for (_0x24c6ef = 0x0; _0x24c6ef < _0x5189eb; _0x24c6ef++)
          (_0x5eacfd[_0x24c6ef] -= _0x5f4fbd(_0x18e103[_0x19baac])),
            _0x5eacfd[_0x24c6ef] < 0x0 && (_0x5eacfd[_0x24c6ef] += 0x1);
    };
    return (
      (_0x57972f["cleanString"] = function (_0x170575) {
        return (_0x170575 = (_0x170575 = (_0x170575 = _0x170575
          .toString()
          ["replace"](/(^\s*)|(\s*$)/gi, ""))["replace"](/[\x00-\x1F]/gi, ""))[
          "replace"
        ](/\n /, "\x0a"));
      }),
      (_0x57972f["hashString"] = function (_0x2e3bc7) {
        for (
          _0x2e3bc7 = _0x57972f["cleanString"](_0x2e3bc7),
            _0x5f4fbd(_0x2e3bc7),
            _0x19baac = 0x0;
          _0x19baac < _0x2e3bc7["length"];
          _0x19baac++
        )
          for (
            _0x5afbb2 = _0x2e3bc7["charCodeAt"](_0x19baac), _0x24c6ef = 0x0;
            _0x24c6ef < _0x5189eb;
            _0x24c6ef++
          )
            (_0x5eacfd[_0x24c6ef] -= _0x5f4fbd(_0x5afbb2)),
              _0x5eacfd[_0x24c6ef] < 0x0 && (_0x5eacfd[_0x24c6ef] += 0x1);
      }),
      (_0x57972f["seed"] = function (_0x4ad8f9) {
        null == _0x4ad8f9 && (_0x4ad8f9 = Math["random"]()),
          "string" != typeof _0x4ad8f9 &&
            (_0x4ad8f9 = _0x3a53ee(_0x4ad8f9, function (_0xd9ff08, _0xc62057) {
              return "function" == typeof _0xc62057
                ? _0xc62057["toString"]()
                : _0xc62057;
            })),
          _0x57972f["initState"](),
          _0x57972f["hashString"](_0x4ad8f9);
      }),
      (_0x57972f["addEntropy"] = function () {
        var _0xd360d3 = [];
        for (_0x19baac = 0x0; _0x19baac < arguments["length"]; _0x19baac++)
          _0xd360d3["push"](arguments[_0x19baac]);
        _0x17463d(
          _0x5afbb2++ +
            new Date()[_0x4373("0x104")]() +
            _0xd360d3[_0x4373("0x35e")]("") +
            Math["random"]()
        );
      }),
      (_0x57972f["initState"] = function () {
        for (_0x5f4fbd(), _0x19baac = 0x0; _0x19baac < _0x5189eb; _0x19baac++) {
          _0x5eacfd[_0x19baac] = _0x5f4fbd("\x20");
        }
        (_0x34d74b = 0x1), (_0x1282de = _0x5189eb);
      }),
      (_0x57972f["done"] = function () {
        _0x5f4fbd = null;
      }),
      void 0x0 !== _0xd1d5 && _0x57972f["seed"](_0xd1d5),
      (_0x57972f["range"] = function (_0x858ee7) {
        return _0x57972f(_0x858ee7);
      }),
      (_0x57972f["random"] = function () {
        return _0x57972f(Number["MAX_VALUE"] - 0x1) / Number["MAX_VALUE"];
      }),
      (_0x57972f["floatBetween"] = function (_0x241d42, _0x2b42a3) {
        return _0x57972f["random"]() * (_0x2b42a3 - _0x241d42) + _0x241d42;
      }),
      (_0x57972f["intBetween"] = function (_0x181995, _0x5bb3cf) {
        return (
          Math[_0x4373("0x1a")](
            _0x57972f["random"]() * (_0x5bb3cf - _0x181995 + 0x1)
          ) + _0x181995
        );
      }),
      _0x57972f
    );
  })();
};

function _0x380484(_0x5ac1fe, _0x807863) {
  console.log(_0x5ac1fe, _0x807863);
  for (
    var _0x127df0 = _0x23aab7(_0x807863),
      _0xfb332d = _0x5ac1fe["length"],
      _0x3a75b5 = 0x0,
      _0x2cb2dc = 0x0,
      _0x5de6d8 = _0x5ac1fe["slice"](0x0);
    _0xfb332d;

  )
    (_0x2cb2dc =
      _0x5de6d8[(_0x3a75b5 = ~~(_0x127df0["random"]() * _0xfb332d--))]),
      (_0x5de6d8[_0x3a75b5] = _0x5de6d8[_0xfb332d]),
      (_0x5de6d8[_0xfb332d] = _0x2cb2dc);
  return _0x5de6d8;
}

function _0x5bab88(_0x52a34c, _0x87bc12) {
  for (
    var _0x1cfe43 = _0x52a34c["length"],
      _0x589af5 = _0x380484(_0x3f476e(_0x1cfe43), _0x87bc12),
      _0x279ba1 = [],
      _0x2561ee = 0x0;
    _0x2561ee < _0x1cfe43;
    ++_0x2561ee
  )
    _0x279ba1[_0x589af5[_0x2561ee]] = _0x52a34c[_0x2561ee];
  return _0x279ba1;
}

function _0x333e23(_0x5dbc66, _0x5b2eff) {
  for (
    var _0x515caa = _0x5dbc66["length"],
      _0x58840c = _0x5b2eff["length"],
      _0x237d2d = [],
      _0x3a5085 = 0x0;
    _0x3a5085 < _0x58840c;
    ++_0x3a5085
  ) {
    var _0x5ee5ad = _0x5b2eff["charCodeAt"](_0x3a5085),
      _0x2bb256 = _0x5dbc66["charCodeAt"](_0x3a5085 % _0x515caa);
    _0x237d2d["push"](String["fromCharCode"](_0x5ee5ad ^ _0x2bb256));
  }
  return _0x237d2d;
}

function _0x380484(_0x5ac1fe, _0x807863) {
  for (
    var _0x127df0 = _0x23aab7(_0x807863),
      _0xfb332d = _0x5ac1fe["length"],
      _0x3a75b5 = 0x0,
      _0x2cb2dc = 0x0,
      _0x5de6d8 = _0x5ac1fe["slice"](0x0);
    _0xfb332d;

  )
    (_0x2cb2dc =
      _0x5de6d8[(_0x3a75b5 = ~~(_0x127df0["random"]() * _0xfb332d--))]),
      (_0x5de6d8[_0x3a75b5] = _0x5de6d8[_0xfb332d]),
      (_0x5de6d8[_0xfb332d] = _0x2cb2dc);
  return _0x5de6d8;
}

function _0x3f476e(_0x17760a) {
  for (var _0x162758 = [], _0x2ba0f8 = 0x0; _0x2ba0f8 < _0x17760a; ++_0x2ba0f8)
    _0x162758["push"](_0x2ba0f8);
  return _0x162758;
}

export default (zid: string, pageData: PageData) => {
  const _0x2db75d = JSON["parse"](
    Object(_0x333e23)(
      zid +
        pageData.key_hash +
        "0a10f3bd42587ad70fc96886d8e5e7b3614ce69529b238a1c690cb9b51d4868f",
      atob(pageData.key_data)
    )["join"]("")
  );

  const obj: {
    [key: string]: Mapping;
  } = {};

  for (var _0x4cb441 in _0x2db75d) {
    var _0x129a8a = pageData.pages[_0x4cb441],
      _0x2390fe = _0x2db75d[_0x4cb441],
      _0x5e557d = _0x2390fe["pop"](),
      _0x1b22c8 = _0x5bab88(_0x2390fe, _0x5e557d),
      _0x113475 = _0x1b22c8[0x2];

    const width = _0x1b22c8[0x0] ^ _0x113475;
    const height = _0x1b22c8[0x1] ^ _0x113475;

    var _0x5423c3 = width / height > 0x1,
      _0xd3efbf = _0x5423c3 ? height : width,
      _0xc8ae4 = 0x80 * Math.ceil(_0xd3efbf / 0x80) - _0xd3efbf,
      _0x31f54e = Math.ceil(width / 0x80),
      _0x5305fb = Math.ceil(height / 0x80);

    obj[_0x4cb441] = {
      ..._0x129a8a,
      width,
      height,
      filename: decodeURIComponent(
        _0x129a8a.image.split("/").at(-1)!.split("?")[0]
      ).replaceAll("/", "_"),
      mapping: _0x380484(_0x3f476e(_0x31f54e * _0x5305fb), _0x113475).map(
        function (_0x3407b1, _0x543c46) {
          var _0x1fa983 = _0x3407b1 % _0x31f54e,
            _0x9a4b0f = (_0x3407b1 - _0x1fa983) / _0x31f54e,
            _0x3257b3 = _0x543c46 % _0x31f54e,
            _0x59de7e = (_0x543c46 - _0x3257b3) / _0x31f54e,
            _0x4a15c1 = _0x5423c3
              ? _0x59de7e === _0x5305fb - 0x1
              : _0x3257b3 === _0x31f54e - 0x1;
          return (
            (_0x3257b3 *= 0x80),
            (_0x59de7e *= 0x80),
            _0x4a15c1 &&
              ((_0x3257b3 -= _0x5423c3 ? 0x0 : _0xc8ae4),
              (_0x59de7e -= _0x5423c3 ? _0xc8ae4 : 0x0)),
            {
              sx: (_0x1fa983 *= 0x80),
              sy: (_0x9a4b0f *= 0x80),
              dx: _0x3257b3,
              dy: _0x59de7e,
            }
          );
        }
      ),
    };
  }

  return obj;
};
