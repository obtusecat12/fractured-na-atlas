#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
mkgmail.py — Pixel-accurate late-2009 (November 5, 2009) Gmail replica generator.
Uses genuine 2009 Wayback Machine Gmail assets (logo1.png, favicon.ico, star_on_2.gif,
star_off_2.gif, paperclip.gif, print_icon.gif, tearoff_icon.gif, expand_icon.gif,
chevron.gif) + cropped 2009 official Google blog icons (labs_flask.png, chat_bubble.png)
and in-world generated 2009 email images (Himalayan salt lamp, aromatherapy, cursed hallway).

Outputs:
  - site/sites/gmail/gmail_preview.html  (standalone HTML for Playwright visual comparison)
  - site/gmailpage.js                    (registers window.GMAIL_FAV and window.CWSITES.gmail)
"""
import os, sys, json, base64

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, 'assets')
sys.path.insert(0, HERE)
import emails_data as ED

MIME = {
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon',
}

def datauri(fname):
    p = os.path.join(ASSETS, fname)
    ext = os.path.splitext(fname)[1].lower()
    raw = open(p, 'rb').read()
    return 'data:%s;base64,%s' % (MIME[ext], base64.b64encode(raw).decode('ascii'))

IMG = {
    'fav': datauri('favicon.png'),
    'logo': datauri('logo1.png'),
    'star_on': datauri('star_on.gif'),
    'star_off': datauri('star_off.gif'),
    'paperclip': datauri('paperclip.gif'),
    'print': datauri('print_icon.gif'),
    'tearoff': datauri('tearoff_icon.gif'),
    'expand': datauri('expand_icon.gif'),
    'collapse': datauri('collapse_icon.gif'),
    'chevron': datauri('chevron.gif'),
    'labs': datauri('labs_flask.png'),
    'chat_bubble': datauri('chat_bubble.png'),
    'dot_green': datauri('dot_green.png'),
    'dot_orange': datauri('dot_orange.png'),
    'dot_red': datauri('dot_red.png'),
    'dot_gray': datauri('dot_gray.png'),
    'promo_salt_lamp': datauri('promo_salt_lamp.jpg'),
    'promo_aromatherapy': datauri('promo_aromatherapy.jpg'),
    'cursed_hallway': datauri('cursed_hallway.jpg'),
}

# Inject generated promo images into html_body placeholders
THREADS = json.loads(json.dumps(ED.THREADS))
for th in THREADS:
    for msg in th['messages']:
        if 'html_body' in msg:
            msg['html_body'] = (
                msg['html_body']
                .replace('__IMG_promo_salt_lamp__', IMG['promo_salt_lamp'])
                .replace('__IMG_promo_aromatherapy__', IMG['promo_aromatherapy'])
                .replace('__IMG_cursed_hallway__', IMG['cursed_hallway'])
            )

DATA_PAYLOAD = {
    'userEmail': ED.USER_EMAIL,
    'userName': ED.USER_NAME,
    'labels': ED.LABELS,
    'webClips': ED.WEB_CLIPS,
    'chatContacts': ED.CHAT_CONTACTS,
    'adSets': ED.AD_SETS,
    'threads': THREADS,
    'img': {
        'star_on': IMG['star_on'],
        'star_off': IMG['star_off'],
        'paperclip': IMG['paperclip'],
        'print': IMG['print'],
        'tearoff': IMG['tearoff'],
        'expand': IMG['expand'],
        'collapse': IMG['collapse'],
        'chevron': IMG['chevron'],
        'chat_bubble': IMG['chat_bubble'],
        'dot_green': IMG['dot_green'],
        'dot_orange': IMG['dot_orange'],
        'dot_red': IMG['dot_red'],
        'dot_gray': IMG['dot_gray'],
        'cursed_hallway': IMG['cursed_hallway'],
        'promo_salt_lamp': IMG['promo_salt_lamp'],
        'promo_aromatherapy': IMG['promo_aromatherapy'],
    },
}

CSS = r"""
html, body {
  margin: 0;
  padding: 0;
  background: #ffffff;
  color: #000000;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  -webkit-font-smoothing: none;
}
/* Classic 2009 Windows/Chrome light-gray scrollbar (not XP blue, not modern thin overlay) */
::-webkit-scrollbar { width: 16px; height: 16px; }
::-webkit-scrollbar-track { background: #f1f1f1; border-left: 1px solid #e0e0e0; }
::-webkit-scrollbar-thumb {
  background: linear-gradient(to right, #e6e6e6, #d4d4d4);
  border: 1px solid #a8a8a8;
  box-shadow: inset 1px 0 0 #ffffff;
}
::-webkit-scrollbar-thumb:hover { background: linear-gradient(to right, #dcdcdc, #c4c4c4); border-color: #888; }
::-webkit-scrollbar-button { background: #ececec; border: 1px solid #c0c0c0; height: 15px; width: 15px; }
a {
  color: #2a5db0;
  text-decoration: underline;
  cursor: pointer;
}
a:hover { color: #2a5db0; }

/* ---- Top Google Universal Bar (#gbar / #guser — exact 2009 Google chrome) ---- */
#gtop {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 23px;
  padding: 1px 8px 0 8px;
  font-size: 13px;
  border-bottom: 1px solid #c9d7f1;
  background: #ffffff;
  white-space: nowrap;
}
#gbar { display: flex; align-items: center; gap: 9px; }
#gbar b { color: #000000; font-weight: bold; }
#gbar a { color: #0000cc; text-decoration: underline; }
#gbar a.gb3 { text-decoration: none; }
#gbar a.gb3 u { text-decoration: underline; }
#gbar a.gb3 small { font-size: 9px; }

#guser {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #000000;
}
#guser b { font-weight: bold; color: #000; }
#guser a { color: #0000cc; text-decoration: underline; }
#guser .sep { color: #000000; }
#guser img.labs {
  width: 11px;
  height: 13px;
  vertical-align: middle;
  cursor: pointer;
}

/* ---- Logo + Search Header Row ---- */
#headrow {
  display: flex;
  align-items: flex-start;
  padding: 2px 8px 4px 0;
  position: relative;
  min-height: 62px;
}
#logocol {
  width: 162px;
  flex: none;
  padding: 2px 0 0 12px;
  box-sizing: border-box;
}
#logocol img {
  display: block;
  width: 143px;
  height: 59px;
  cursor: pointer;
  border: 0;
}
#searchcol {
  flex: 1;
  min-width: 0;
  padding-top: 13px;
}
#searchform {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 4px;
}
#sq {
  width: 268px;
  height: 20px;
  padding: 1px 3px;
  font: 13px Arial, sans-serif;
  border: 1px solid #7f9db9;
  border-top-color: #6b88a6;
  background: #ffffff;
  color: #000;
  box-sizing: border-box;
}
.gbtn-native {
  font: 12px Arial, sans-serif;
  height: 22px;
  padding: 0 7px;
  color: #000000;
  background: linear-gradient(to bottom, #f9f9f9 0%, #efefef 52%, #dedede 100%);
  border: 1px solid #7b7b7b;
  border-radius: 2px;
  cursor: pointer;
  white-space: nowrap;
}
.gbtn-native:hover { border-color: #444; background: linear-gradient(to bottom, #ffffff 0%, #f2f2f2 52%, #e3e3e3 100%); }
.gbtn-native:active { background: #dcdcdc; }
#slinks {
  display: flex;
  flex-direction: column;
  margin-left: 4px;
  line-height: 12px;
  font-size: 10px;
}
#slinks a { color: #2a5db0; white-space: nowrap; }

/* Classic 2009 Yellow Butterbar Notification */
#butterbar-wrap {
  position: absolute;
  left: 0;
  right: 0;
  top: 41px;
  text-align: center;
  pointer-events: none;
  z-index: 20;
}
#butterbar {
  display: none;
  background: #fff1a8;
  border: 1px solid #f0c36d;
  border-radius: 3px;
  padding: 2px 10px;
  font: bold 12px Arial, sans-serif;
  color: #000000;
  pointer-events: auto;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
}
#butterbar.show { display: inline-block; }
#butterbar a { color: #2a5db0; font-weight: normal; margin-left: 6px; }

/* ---- Main Two-Column Layout ---- */
#workspace {
  display: flex;
  align-items: flex-start;
  padding: 0 8px 10px 0;
}

/* ---- Left Sidebar (exact post-July 2009 Classic Blue Theme) ---- */
#leftnav {
  width: 162px;
  flex: none;
  padding: 2px 0 0 6px;
  box-sizing: border-box;
  user-select: none;
}
#compose-link {
  display: block;
  margin: 0 0 6px 0;
  padding: 2px 6px 2px 10px;
  font: bold 13px/18px Arial, sans-serif;
  color: #2a5db0;
  text-decoration: underline;
  cursor: pointer;
  border-radius: 3px 0 0 3px;
}
#compose-link:hover { background: #e8eef7; }
#compose-link.active {
  background: #6694e3;
  color: #ffffff;
}
#compose-link.active:hover { background: #6694e3; }
.nav-item {
  display: flex;
  align-items: center;
  padding: 2px 6px 2px 10px;
  font: 13px/18px Arial, sans-serif;
  color: #2a5db0;
  text-decoration: underline;
  cursor: pointer;
  border-radius: 3px 0 0 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nav-item:hover { background: #e8eef7; }
.nav-item.unread { font-weight: bold; }
.nav-item.active {
  background: #6694e3;
  color: #ffffff;
  font-weight: bold;
  text-decoration: underline;
}
.nav-item.active:hover { background: #6694e3; }
.nav-item img.nico {
  margin-left: 4px;
  vertical-align: middle;
  border: 0;
}
.nav-div {
  height: 1px;
  background: #d7e4f8;
  margin: 5px 8px 5px 6px;
}
.lbl-swatch {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  margin-right: 6px;
  flex: none;
  border: 1px solid rgba(0,0,0,0.12);
  box-sizing: border-box;
}
.nav-item.active .lbl-swatch { border-color: rgba(255,255,255,0.65); }
.nav-more {
  padding: 2px 6px 2px 10px;
  font: 12px/18px Arial, sans-serif;
  color: #2a5db0;
  cursor: pointer;
}
.nav-more span { text-decoration: underline; }
.nav-more .tri { font-size: 9px; margin-left: 2px; text-decoration: none; display: inline-block; }
.nav-sublink {
  display: block;
  padding: 2px 6px 2px 10px;
  font: 13px/18px Arial, sans-serif;
  color: #2a5db0;
  text-decoration: underline;
  cursor: pointer;
}
.nav-sublink:hover { background: #e8eef7; }

/* Embedded 2009 Gmail Chat Widget */
.sidebox {
  margin: 10px 8px 6px 4px;
  border: 1px solid #c3d9ff;
  border-radius: 3px;
  background: #ffffff;
  overflow: hidden;
}
.sidebox-hdr {
  background: #e0ecff;
  padding: 3px 6px;
  font: bold 11px/14px Arial, sans-serif;
  color: #222222;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.sidebox-hdr .pm {
  display: inline-block;
  width: 9px;
  height: 9px;
  line-height: 8px;
  text-align: center;
  font-size: 10px;
  color: #2a5db0;
  font-weight: bold;
}
.chat-body { padding: 4px 5px 5px 5px; }
#chat-search {
  width: 100%;
  box-sizing: border-box;
  font: 11px Arial, sans-serif;
  padding: 2px 3px;
  border: 1px solid #b5c6dc;
  color: #777777;
  margin-bottom: 5px;
}
.chat-me {
  padding: 2px 2px 5px 2px;
  border-bottom: 1px solid #e5ecf9;
  margin-bottom: 3px;
  font-size: 11px;
}
.chat-me-top { display: flex; align-items: center; gap: 4px; font-weight: bold; color: #222; }
.chat-me-sub { color: #777; font-size: 10px; margin-left: 13px; cursor: pointer; }
.chat-row {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 2px 3px;
  font: 11px/15px Arial, sans-serif;
  color: #222;
  cursor: pointer;
  border-radius: 2px;
}
.chat-row:hover { background: #e8eef7; }
.chat-row.offline { color: #888888; }
.chat-row img { width: 9px; height: 9px; flex: none; }
.chat-row .cname { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chat-foot {
  display: flex;
  justify-content: space-between;
  padding: 4px 2px 0 2px;
  margin-top: 3px;
  border-top: 1px solid #e5ecf9;
  font-size: 10px;
}
.chat-foot a { color: #2a5db0; }

.invite-body {
  padding: 6px;
  font-size: 11px;
  color: #333;
}
.invite-body input[type=text] {
  width: 100%;
  box-sizing: border-box;
  font: 11px Arial, sans-serif;
  padding: 2px 3px;
  border: 1px solid #b5c6dc;
  margin-bottom: 5px;
}

/* ---- Main Right Blue Frame (exact 4px #6694e3 border from ref_2009_07_hiplabels.png) ---- */
#maincol {
  flex: 1;
  min-width: 0;
}
#blueframe {
  border: 4px solid #6694e3;
  border-radius: 5px;
  background: #ffffff;
  overflow: visible;
}
/* Web Clip Bar inside top of blue frame */
#webclip {
  background: #6694e3;
  color: #ffffff;
  height: 22px;
  line-height: 20px;
  padding: 0 5px 2px 6px;
  font: 12px/20px Arial, sans-serif;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
#webclip-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
#webclip-text a { color: #ffffff; text-decoration: underline; }
#webclip-text .wc-src { color: #dbe9ff; }
#webclip-nav {
  flex: none;
  display: flex;
  gap: 2px;
}
#webclip-nav a {
  display: inline-block;
  width: 15px;
  height: 15px;
  line-height: 14px;
  text-align: center;
  color: #ffffff;
  text-decoration: none;
  font: bold 11px Arial, sans-serif;
  border: 1px solid rgba(255,255,255,0.35);
  border-radius: 2px;
}
#webclip-nav a:hover { background: rgba(255,255,255,0.2); }

/* ---- Action Toolbar & Select Bar (#e0ecff — exact sampled color!) ---- */
.tbar {
  background: #e0ecff;
  padding: 5px 6px 4px 6px;
  font: 12px Arial, sans-serif;
  user-select: none;
}
.tbar-top { border-bottom: 1px solid #cad4e6; }
.tbar-bot { border-top: 1px solid #cad4e6; }
.tbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  flex-wrap: nowrap;
}
.tbar-left {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}
.tbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #222;
  white-space: nowrap;
}
.tbar-right a { color: #2a5db0; }
.tbar-right .dis { color: #888; text-decoration: none; cursor: default; }

/* Joined 2009 Gmail CSS Gradient Buttons (exact match to ref_move_to.png & ref_2009_07_hiplabels.png) */
.bgrp {
  display: inline-flex;
  align-items: stretch;
}
.gb {
  position: relative;
  height: 22px;
  line-height: 20px;
  padding: 0 8px;
  font: 12px/20px Arial, sans-serif;
  color: #000000;
  background: linear-gradient(to bottom, #f9f9f9 0%, #f1f1f1 50%, #e3e3e3 100%);
  border: 1px solid #bbbbbb;
  margin-left: -1px;
  cursor: pointer;
  white-space: nowrap;
  box-sizing: border-box;
}
.gb:first-child { margin-left: 0; border-radius: 2px 0 0 2px; }
.gb:last-child { border-radius: 0 2px 2px 0; }
.gb:only-child { border-radius: 2px; }
.gb:hover { border-color: #888888; z-index: 2; background: linear-gradient(to bottom, #ffffff 0%, #f5f5f5 50%, #e7e7e7 100%); }
.gb:active, .gb.open {
  background: #888888;
  color: #ffffff;
  border-color: #666666;
  z-index: 3;
}
.gb.bold { font-weight: bold; }
.gb .tri { font-size: 9px; margin-left: 3px; }
.tbar-link {
  color: #2a5db0;
  font: 12px Arial, sans-serif;
  text-decoration: underline;
  cursor: pointer;
}
.tbar-back {
  color: #2a5db0;
  font: 12px Arial, sans-serif;
  text-decoration: underline;
  cursor: pointer;
  margin-right: 4px;
}

.selbar {
  margin-top: 4px;
  font: 12px/16px Arial, sans-serif;
  color: #000000;
}
.selbar-bot {
  margin-top: 0;
  margin-bottom: 5px;
}
.selbar a { color: #2a5db0; margin-right: 1px; }

/* Dropdown Menus (Move to / Labels / More actions — exact match to ref_move_to.png!) */
.dd-wrap { position: relative; display: inline-flex; }
.dd-menu {
  display: none;
  position: absolute;
  top: 22px;
  left: 0;
  min-width: 158px;
  background: #ffffff;
  border: 1px solid #999999;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.22);
  z-index: 50;
  padding: 4px 0 3px 0;
  font: 12px Arial, sans-serif;
  color: #000;
}
.dd-menu.open { display: block; }
.dd-srch-wrap {
  padding: 2px 6px 5px 6px;
}
.dd-srch {
  width: 100%;
  box-sizing: border-box;
  height: 20px;
  padding: 1px 18px 1px 4px;
  font: 11px Arial, sans-serif;
  border: 1px solid #999999;
  border-top-color: #666666;
  background: #ffffff;
  color: #000;
}
.dd-item {
  padding: 4px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.dd-item:hover { background: #ffffcc; }
.dd-sep { height: 1px; background: #e0e0e0; margin: 3px 0; }

/* ---- Message List Table (exact 23px row height, #ffffff unread / #efefef read!) ---- */
#msgtable {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  background: #ffffff;
}
#msgtable tr.mr {
  height: 23px;
  border-bottom: 1px solid #d6d6d6;
  cursor: pointer;
  font: 13px/18px Arial, sans-serif;
  color: #000000;
}
#msgtable tr.mr.unread { background: #ffffff; }
#msgtable tr.mr.read { background: #efefef; }
#msgtable tr.mr.selected { background: #ffffcc; }
#msgtable tr.mr td {
  padding: 2px 0;
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.col-grip { width: 13px; padding-left: 4px !important; }
.grip {
  display: inline-block;
  width: 6px;
  height: 14px;
  vertical-align: middle;
  background-image:
    linear-gradient(to right, #bababa 2px, transparent 2px, transparent 4px, #bababa 4px),
    linear-gradient(to right, #bababa 2px, transparent 2px, transparent 4px, #bababa 4px),
    linear-gradient(to right, #bababa 2px, transparent 2px, transparent 4px, #bababa 4px),
    linear-gradient(to right, #bababa 2px, transparent 2px, transparent 4px, #bababa 4px);
  background-size: 6px 2px;
  background-position: 0 0, 0 4px, 0 8px, 0 12px;
  background-repeat: no-repeat;
}
.col-chk { width: 22px; text-align: center; }
.col-chk input[type=checkbox] {
  -webkit-appearance: none;
  appearance: none;
  width: 13px;
  height: 13px;
  margin: 0;
  vertical-align: middle;
  cursor: pointer;
  border: 1px solid #8e8f8f;
  background: linear-gradient(to bottom, #e3e4e5 0%, #f4f4f4 45%, #ffffff 100%);
  box-shadow: inset 1px 1px 0 #bcbfc2;
  position: relative;
}
.col-chk input[type=checkbox]:checked::after {
  content: "";
  position: absolute;
  left: 3px;
  top: 0px;
  width: 4px;
  height: 7px;
  border: solid #1b3688;
  border-width: 0 2px 2px 0;
  transform: rotate(42deg);
}
.col-star { width: 21px; text-align: center; }
.col-star img { width: 15px; height: 15px; vertical-align: middle; cursor: pointer; }
.col-from { width: 172px; padding-right: 8px !important; color: #000; }
.mr.unread .col-from { font-weight: bold; }
.mr.read .col-from { color: #222; }
.from-draft { color: #cc0000; font-weight: normal; }
.from-cnt { font-weight: normal; color: #555; font-size: 12px; }
.col-subj { padding-right: 6px !important; }
.mr.unread .subj-txt { font-weight: bold; color: #000; }
.mr.read .subj-txt { font-weight: normal; color: #000; }
.snip-txt { color: #777777; font-weight: normal; }
.lbl-pill {
  display: inline-block;
  font: 11px/14px Arial, sans-serif;
  padding: 0 4px;
  border-radius: 2px;
  margin-right: 5px;
  vertical-align: 1px;
}
.col-att { width: 20px; text-align: center; }
.col-att img { width: 15px; height: 15px; vertical-align: middle; }
.col-date {
  width: 68px;
  text-align: right;
  padding-right: 8px !important;
  font-size: 12px;
  color: #222;
}
.mr.unread .col-date { font-weight: bold; color: #000; }

.empty-box {
  padding: 28px 16px;
  text-align: center;
  color: #444;
  font: 13px Arial, sans-serif;
  background: #ffffff;
}
.spam-banner {
  background: #fff4c2;
  border-bottom: 1px solid #e6d17a;
  padding: 6px 10px;
  font: 12px Arial, sans-serif;
  color: #222;
  text-align: center;
}

/* ---- Conversation View (2009 Stacked Cards + Right Sponsored Links!) ---- */
#conv-wrap {
  display: flex;
  align-items: flex-start;
  padding: 10px 8px 14px 10px;
  gap: 14px;
  background: #ffffff;
}
#conv-main {
  flex: 1;
  min-width: 0;
}
#conv-subj-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0 0 10px 0;
}
#conv-subj {
  font: bold 16px/20px Arial, sans-serif;
  color: #000000;
  margin: 0;
}
.conv-lbl {
  display: inline-flex;
  align-items: center;
  font: 11px/16px Arial, sans-serif;
  border-radius: 2px;
  overflow: hidden;
}
.conv-lbl .ln { padding: 0 5px; }
.conv-lbl .lx {
  padding: 0 4px;
  border-left: 1px solid rgba(255,255,255,0.35);
  cursor: pointer;
  font-weight: bold;
}
.conv-lbl .lx:hover { background: rgba(0,0,0,0.18); }

/* Collapsed message strip in multi-message thread */
.msg-collapsed {
  border: 1px solid #cccccc;
  border-radius: 4px;
  background: #f5f5f5;
  padding: 6px 10px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  font: 12px Arial, sans-serif;
}
.msg-collapsed:hover { background: #edf2f9; }
.msg-collapsed-left {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  min-width: 0;
}
.msg-collapsed-snip { color: #777; overflow: hidden; text-overflow: ellipsis; }
.msg-collapsed-date { flex: none; color: #555; font-size: 11px; }

/* Expanded message card */
.msg-card {
  border: 1px solid #cccccc;
  border-radius: 4px;
  background: #ffffff;
  margin-bottom: 8px;
  overflow: hidden;
}
.msg-hdr {
  padding: 7px 10px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  background: #ffffff;
  border-bottom: 1px solid #efefef;
}
.msg-hdr-left {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
  font: 13px/18px Arial, sans-serif;
}
.msg-hdr-left img.mstar { width: 15px; height: 15px; vertical-align: -2px; cursor: pointer; }
.msg-sender { font-weight: bold; }
.msg-to { color: #555555; font-size: 12px; }
.msg-hdr-right {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font: 12px Arial, sans-serif;
  color: #444;
  white-space: nowrap;
}
.msg-details-tbl {
  margin: 0;
  padding: 6px 10px 8px 31px;
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  font: 12px/17px Arial, sans-serif;
}
.msg-details-tbl table { border-collapse: collapse; }
.msg-details-tbl td.dk {
  text-align: right;
  color: #666666;
  padding: 1px 10px 1px 0;
  vertical-align: top;
  white-space: nowrap;
}
.msg-details-tbl td.dv { color: #000000; padding: 1px 0; }

/* Authentic 2009 Gmail "Images are not displayed" Yellow Security Bar */
.img-block-bar {
  background: #ffffd9;
  border-bottom: 1px solid #e6db55;
  padding: 5px 10px;
  font: 11px/15px Arial, sans-serif;
  color: #222222;
}
.img-block-bar a { color: #2a5db0; font-weight: bold; }

.msg-body {
  padding: 12px 14px 14px 14px;
  font: 13px/1.45 Arial, Helvetica, sans-serif;
  color: #000000;
  overflow-x: auto;
}
.msg-plain {
  white-space: pre-wrap;
  word-wrap: break-word;
  font: 13px/1.48 Arial, Helvetica, sans-serif;
  margin: 0;
}
.msg-quote {
  color: #550055;
  border-left: 1px solid #cccccc;
  padding-left: 8px;
  margin: 6px 0;
}
.msg-att-box {
  border-top: 1px dashed #cccccc;
  padding: 8px 14px;
  background: #fafafa;
  font: 12px Arial, sans-serif;
}
.att-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 6px;
}
.att-thumb {
  border: 1px solid #bbbbbb;
  padding: 2px;
  background: #fff;
  cursor: pointer;
  max-width: 150px;
  max-height: 112px;
  display: block;
}
.att-meta b { color: #000; }
.att-meta .asz { color: #666; margin-left: 5px; font-size: 11px; }
.att-meta .alinks { margin-top: 3px; font-size: 11px; }
.att-meta .alinks a { margin-right: 8px; }

.msg-foot {
  background: #f5f5f5;
  border-top: 1px solid #e5e5e5;
  padding: 6px 12px;
  font: 12px Arial, sans-serif;
  color: #555;
}
.msg-foot a { color: #2a5db0; margin-right: 10px; }

/* Inline Quick Reply Box */
.reply-box {
  border: 1px solid #cccccc;
  border-radius: 4px;
  background: #e8eef7;
  padding: 10px 12px;
  margin-top: 8px;
}
.reply-box textarea {
  width: 100%;
  box-sizing: border-box;
  height: 110px;
  font: 13px Arial, sans-serif;
  padding: 6px;
  border: 1px solid #7f9db9;
  margin: 6px 0 8px 0;
}

/* Conversation Right Sidebar (Expand all / Print all / New window + Sponsored Links) */
#conv-side {
  width: 178px;
  flex: none;
  font: 12px/16px Arial, sans-serif;
}
.cside-acts {
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5ecf9;
}
.cside-act {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  color: #2a5db0;
  text-decoration: underline;
  cursor: pointer;
  font-size: 12px;
}
.cside-act img { width: 15px; height: 15px; border: 0; }
.ads-hdr {
  color: #666666;
  font-size: 11px;
  margin-bottom: 8px;
}
.ad-item {
  margin-bottom: 11px;
  font-size: 12px;
  line-height: 15px;
}
.ad-item a.ad-t { color: #2a5db0; font-weight: bold; text-decoration: underline; display: block; }
.ad-item .ad-d { color: #000000; font-size: 11px; }
.ad-item .ad-u { color: #008000; font-size: 11px; }
.ads-about { font-size: 10px; color: #777; margin-top: 6px; }

/* ---- Compose View (authentic 2009 Gmail Compose Mail screen) ---- */
#compose-wrap {
  background: #e0ecff;
  padding: 8px 12px 14px 12px;
}
.comp-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  font: 12px Arial, sans-serif;
}
.comp-table td.ck {
  width: 68px;
  text-align: right;
  padding: 4px 8px 4px 0;
  font-weight: bold;
  color: #222;
  vertical-align: top;
}
.comp-table td.cv { padding: 3px 0; }
.comp-table input[type=text] {
  width: 100%;
  max-width: 560px;
  box-sizing: border-box;
  font: 13px Arial, sans-serif;
  padding: 2px 4px;
  border: 1px solid #7f9db9;
}
.comp-rtbar {
  background: #f3f3f3;
  border: 1px solid #b5c6dc;
  border-bottom: 0;
  padding: 4px 6px;
  max-width: 560px;
  box-sizing: border-box;
  font: 12px Georgia, serif;
  color: #333;
  display: flex;
  gap: 10px;
  align-items: center;
}
.comp-rtbar span { cursor: pointer; padding: 0 3px; }
.comp-rtbar span:hover { background: #dce6f4; }
#comp-body {
  width: 100%;
  max-width: 560px;
  height: 220px;
  box-sizing: border-box;
  font: 13px/1.45 Arial, sans-serif;
  padding: 6px;
  border: 1px solid #7f9db9;
  display: block;
}

/* ---- Classic 2009 Gmail Footer ---- */
#gfoot {
  text-align: center;
  padding: 10px 8px 14px 8px;
  font: 11px/18px Arial, sans-serif;
  color: #444444;
}
#gfoot .f-tip { color: #000000; margin-bottom: 4px; }
#gfoot .f-quota { color: #006633; font-weight: bold; }
#gfoot .f-act { color: #666666; margin-top: 2px; }
#gfoot .f-links { margin-top: 4px; color: #666666; }
#gfoot a { color: #2a5db0; }

/* ---- Mini Floating 2009 Google Talk Chat Popup ---- */
#chat-pop {
  display: none;
  position: fixed;
  right: 16px;
  bottom: 0;
  width: 235px;
  background: #ffffff;
  border: 1px solid #527ec9;
  border-bottom: 0;
  border-radius: 3px 3px 0 0;
  box-shadow: 0 -1px 6px rgba(0,0,0,0.22);
  z-index: 80;
  font: 12px Arial, sans-serif;
}
#chat-pop.open { display: block; }
#chat-pop-hdr {
  background: #6694e3;
  color: #ffffff;
  padding: 4px 7px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
#chat-pop-hdr .cx { cursor: pointer; font-weight: bold; padding: 0 3px; }
#chat-pop-log {
  height: 155px;
  overflow-y: auto;
  padding: 6px 8px;
  font-size: 11px;
  line-height: 1.4;
  background: #ffffff;
  color: #222;
}
#chat-pop-in {
  width: 100%;
  box-sizing: border-box;
  border: 0;
  border-top: 1px solid #c3d9ff;
  padding: 5px 6px;
  font: 12px Arial, sans-serif;
  outline: none;
}

/* ---- Image Lightbox Modal ---- */
#lightbox {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.72);
  z-index: 120;
  align-items: center;
  justify-content: center;
}
#lightbox.open { display: flex; }
#lightbox-box {
  background: #ffffff;
  border: 3px solid #6694e3;
  border-radius: 4px;
  padding: 10px;
  max-width: 90vw;
  max-height: 88vh;
  text-align: center;
  box-shadow: 0 6px 24px rgba(0,0,0,0.5);
}
#lightbox-box img { max-width: 82vw; max-height: 74vh; display: block; margin: 0 auto 8px; border: 1px solid #ccc; }
#lightbox-cap { font: 12px Arial, sans-serif; color: #333; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
"""

JS = r"""
(function () {
  var D = window.GMAIL_DATA;
  var IMG = D.img;
  var PAGE_SIZE = 25;

  var state = {
    view: 'list',       // 'list' | 'conv' | 'compose'
    folder: 'inbox',    // 'inbox' | 'starred' | 'sent' | 'drafts' | 'all' | 'spam' | 'trash' | 'label:<id>' | 'search'
    searchQuery: '',
    page: 0,
    selected: {},
    activeThreadId: null,
    expandedMsgs: {},
    detailsOpen: {},
    imagesShown: {},
    webClipIdx: 0,
    chatOpen: true,
    inviteOpen: false,
    moreLabelsOpen: false,
    activeChat: null,
    chatHistory: {
      'Dave Kowalski': [
        { who: 'Dave', txt: 'u still alive after that press conference lol' },
        { who: 'me', txt: 'yeah just got back from campus' },
        { who: 'Dave', txt: 'dont go to costco today trust me' }
      ],
      'Kyle Ramirez': [
        { who: 'Kyle', txt: 'dude forward that clarissa email right now im not joking' },
        { who: 'me', txt: 'kyle ur 29 years old' }
      ],
      'Mom': [
        { who: 'Mom', txt: 'Call me tonight if your cell works' }
      ],
      'Uncle Ray': [
        { who: 'sys', txt: 'Uncle Ray is offline. Last seen Feb 27, 2009. Messages sent now will be delivered when they sign in.' }
      ]
    }
  };

  var SENDER_COLORS = ['#00681c', '#790619', '#1b4f9c', '#5b1b9c', '#9c4c1b'];
  var butterTimer = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showButter(msg, undoFn) {
    var b = document.getElementById('butterbar');
    b.innerHTML = esc(msg) + (undoFn ? ' <a href="#" id="bb-undo">Undo</a>' : '');
    b.classList.add('show');
    if (undoFn) {
      var u = document.getElementById('bb-undo');
      if (u) u.onclick = function (e) { e.preventDefault(); undoFn(); b.classList.remove('show'); };
    }
    clearTimeout(butterTimer);
    butterTimer = setTimeout(function () { b.classList.remove('show'); }, 4500);
  }

  function getLabelObj(id) {
    for (var i = 0; i < D.labels.length; i++) if (D.labels[i].id === id) return D.labels[i];
    return { id: id, name: id, bg: '#dddddd', fg: '#222222' };
  }

  function hasMe(th) {
    for (var i = 0; i < th.messages.length; i++) if (th.messages[i].is_me && !th.messages[i].is_draft) return true;
    return false;
  }

  function hasAttachments(th) {
    for (var i = 0; i < th.messages.length; i++) {
      if (th.messages[i].attachments && th.messages[i].attachments.length) return true;
    }
    return false;
  }

  function formatSenderCell(th) {
    if (th.folder === 'drafts') {
      var to = th.messages[0].to_str || '';
      var nm = to.split('<')[0].trim() || to;
      return '<span class="from-draft">Draft</span>' + (nm ? ', ' + esc(nm) : '');
    }
    if (state.folder === 'sent') {
      var last = th.messages[th.messages.length - 1];
      var toS = (last.to_str || '').split('<')[0].trim() || last.to_str || '';
      return 'To: ' + esc(toS) + (th.messages.length > 1 ? ' <span class="from-cnt">(' + th.messages.length + ')</span>' : '');
    }
    var names = [], seen = {};
    for (var i = 0; i < th.messages.length; i++) {
      var n = th.messages[i].is_me ? 'me' : th.messages[i].sender_name;
      if (!seen[n]) { seen[n] = 1; names.push(n); }
    }
    var cnt = th.messages.length > 1 ? ' <span class="from-cnt">(' + th.messages.length + ')</span>' : '';
    return esc(names.join(', ')) + cnt;
  }

  function filteredThreads() {
    var f = state.folder;
    var q = state.searchQuery.trim().toLowerCase();
    return D.threads.filter(function (th) {
      if (f === 'search') {
        if (!q) return th.folder !== 'trash' && th.folder !== 'spam';
        var hay = (th.subject + ' ' + th.snippet + ' ' + th.labels.join(' ')).toLowerCase();
        for (var i = 0; i < th.messages.length; i++) {
          var m = th.messages[i];
          hay += ' ' + (m.sender_name || '') + ' ' + (m.sender_email || '') + ' ' + (m.body || '') + ' ' + (m.html_body || '');
        }
        return hay.toLowerCase().indexOf(q) !== -1;
      }
      if (f === 'inbox') return th.folder === 'inbox';
      if (f === 'starred') return th.starred && th.folder !== 'trash' && th.folder !== 'spam';
      if (f === 'chats') return th.folder === 'chats';
      if (f === 'sent') return (th.folder === 'sent' || hasMe(th)) && th.folder !== 'trash' && th.folder !== 'spam';
      if (f === 'drafts') return th.folder === 'drafts';
      if (f === 'all') return th.folder !== 'spam' && th.folder !== 'trash' && th.folder !== 'chats';
      if (f === 'spam') return th.folder === 'spam';
      if (f === 'trash') return th.folder === 'trash';
      if (f.indexOf('label:') === 0) {
        var lid = f.slice(6);
        return th.folder !== 'trash' && th.folder !== 'spam' && th.labels.indexOf(lid) !== -1;
      }
      return false;
    });
  }

  function countUnread(folder) {
    var n = 0;
    D.threads.forEach(function (th) {
      if (folder === 'inbox' && th.folder === 'inbox' && th.unread) n++;
      else if (folder === 'spam' && th.folder === 'spam' && th.unread) n++;
      else if (folder === 'drafts' && th.folder === 'drafts') n++;
      else if (folder.indexOf('label:') === 0) {
        var lid = folder.slice(6);
        if (th.folder !== 'trash' && th.folder !== 'spam' && th.unread && th.labels.indexOf(lid) !== -1) n++;
      }
    });
    return n;
  }

  function folderTitle(f) {
    if (f === 'inbox') return 'Inbox';
    if (f === 'starred') return 'Starred';
    if (f === 'chats') return 'Chats';
    if (f === 'sent') return 'Sent Mail';
    if (f === 'drafts') return 'Drafts';
    if (f === 'all') return 'All Mail';
    if (f === 'spam') return 'Spam';
    if (f === 'trash') return 'Trash';
    if (f === 'search') return 'Search results';
    if (f.indexOf('label:') === 0) return '"' + f.slice(6) + '"';
    return 'Inbox';
  }

  function syncTitle() {
    var u = countUnread('inbox');
    var t = 'Gmail - ' + folderTitle(state.folder) + (state.folder === 'inbox' && u ? ' (' + u + ')' : '') + ' - ' + D.userEmail;
    document.title = t;
    try { parent.postMessage({ gmailTitle: t }, '*'); } catch (_) {}
  }

  function renderWebClip() {
    var wc = D.webClips[state.webClipIdx % D.webClips.length];
    document.getElementById('webclip-text').innerHTML =
      '<a href="#" onclick="return false;">' + esc(wc.title) + '</a> <span class="wc-src">- ' + esc(wc.source) + ' &mdash; ' + esc(wc.body) + '</span>';
  }

  function renderLeftNav() {
    var inboxU = countUnread('inbox');
    var draftC = countUnread('drafts');
    var spamU = countUnread('spam');
    var nav = [
      { k: 'inbox',   label: 'Inbox' + (inboxU ? ' (' + inboxU + ')' : ''), unread: inboxU > 0 },
      { k: 'starred', label: 'Starred', ico: IMG.star_on, icoW: 13, icoH: 13 },
      { k: 'chats',   label: 'Chats',   ico: IMG.chat_bubble, icoW: 14, icoH: 12 },
      { k: 'sent',    label: 'Sent Mail' },
      { k: 'drafts',  label: 'Drafts' + (draftC ? ' (' + draftC + ')' : ''), unread: draftC > 0 },
      { k: 'all',     label: 'All Mail' },
      { k: 'spam',    label: 'Spam' + (spamU ? ' (' + spamU + ')' : ''), unread: spamU > 0 },
      { k: 'trash',   label: 'Trash' }
    ];

    var html = '<a id="compose-link" class="' + (state.view === 'compose' ? 'active' : '') + '" href="#">Compose Mail</a>';
    nav.forEach(function (it) {
      var cls = 'nav-item' + (state.view !== 'compose' && state.folder === it.k ? ' active' : '') + (it.unread ? ' unread' : '');
      var ico = it.ico ? '<img class="nico" src="' + it.ico + '" width="' + it.icoW + '" height="' + it.icoH + '" alt="">' : '';
      html += '<div class="' + cls + '" data-folder="' + it.k + '">' + esc(it.label) + ico + '</div>';
    });

    html += '<div class="nav-div"></div>';
    D.labels.forEach(function (lb) {
      var lu = countUnread('label:' + lb.id);
      var key = 'label:' + lb.id;
      var cls = 'nav-item' + (state.view !== 'compose' && state.folder === key ? ' active' : '') + (lu ? ' unread' : '');
      html += '<div class="' + cls + '" data-folder="' + esc(key) + '">' +
        '<span class="lbl-swatch" style="background:' + lb.bg + '"></span>' +
        esc(lb.name) + (lu ? ' (' + lu + ')' : '') + '</div>';
    });

    html += '<div class="nav-div"></div>';
    html += '<div class="nav-sublink" id="nav-contacts">Contacts</div>';
    html += '<div class="nav-sublink" id="nav-tasks">Tasks</div>';

    // Embedded 2009 Gmail Chat Box
    html += '<div class="sidebox">' +
      '<div class="sidebox-hdr" id="chat-toggle"><span class="pm">' + (state.chatOpen ? '&minus;' : '+') + '</span> Chat</div>';
    if (state.chatOpen) {
      html += '<div class="chat-body">' +
        '<input id="chat-search" type="text" value="" placeholder="Search, add, or invite">' +
        '<div class="chat-me">' +
          '<div class="chat-me-top"><img src="' + IMG.dot_green + '" width="9" height="9" alt=""><span>Brian</span></div>' +
          '<div class="chat-me-sub">Set status here &#9662;</div>' +
        '</div>';
      D.chatContacts.forEach(function (c) {
        var dot = IMG['dot_' + c.status] || IMG.dot_gray;
        var off = c.status === 'gray' ? ' offline' : '';
        html += '<div class="chat-row' + off + '" data-chat="' + esc(c.name) + '" title="' + esc(c.msg || c.name) + '">' +
          '<img src="' + dot + '" width="9" height="9" alt=""><span class="cname">' + esc(c.name) + '</span></div>';
      });
      html += '<div class="chat-foot"><a href="#" id="chat-opts">Options &#9662;</a><a href="#" id="chat-add">Add Contact</a></div>' +
        '</div>';
    }
    html += '</div>';

    // Classic 2009 "Invite a friend" box
    html += '<div class="sidebox">' +
      '<div class="sidebox-hdr" id="invite-toggle"><span class="pm">' + (state.inviteOpen ? '&minus;' : '+') + '</span> Invite a friend</div>';
    if (state.inviteOpen) {
      html += '<div class="invite-body">' +
        '<div style="margin-bottom:4px;">Give Gmail to:</div>' +
        '<input type="text" id="inv-email" placeholder="friend@example.com">' +
        '<button type="button" class="gbtn-native" id="inv-send">Send Invite</button> <span style="color:#666">50 left</span>' +
      '</div>';
    }
    html += '</div>';

    var el = document.getElementById('leftnav');
    el.innerHTML = html;

    document.getElementById('compose-link').onclick = function (e) {
      e.preventDefault();
      state.view = 'compose';
      renderAll();
    };
    el.querySelectorAll('.nav-item').forEach(function (node) {
      node.onclick = function () {
        state.folder = node.getAttribute('data-folder');
        state.view = 'list';
        state.page = 0;
        state.selected = {};
        renderAll();
      };
    });
    document.getElementById('nav-contacts').onclick = function () { showButter('Contacts (48) — Synced with bmiller79@gmail.com'); };
    document.getElementById('nav-tasks').onclick = function () { showButter('Tasks: Pick up Zone 4 ration booklet Sat 8am; Return Cadillac Desert to CSUS Library.'); };
    document.getElementById('chat-toggle').onclick = function () { state.chatOpen = !state.chatOpen; renderLeftNav(); };
    document.getElementById('invite-toggle').onclick = function () { state.inviteOpen = !state.inviteOpen; renderLeftNav(); };
    if (state.inviteOpen) {
      var isb = document.getElementById('inv-send');
      if (isb) isb.onclick = function () {
        var v = (document.getElementById('inv-email').value || '').trim();
        if (!v) return showButter('Enter an email address to send an invite.');
        document.getElementById('inv-email').value = '';
        showButter('Your invitation has been sent to ' + v + '.');
      };
    }
    el.querySelectorAll('.chat-row').forEach(function (r) {
      r.onclick = function () { openChatPop(r.getAttribute('data-chat')); };
    });
  }

  function buildToolbar(isTop, total, startIdx, endIdx, isConv) {
    var cls = 'tbar ' + (isTop ? 'tbar-top' : 'tbar-bot');
    var ddId = (isTop ? 'top' : 'bot') + (isConv ? 'c' : 'l');
    var isSpam = state.folder === 'spam';
    var isTrash = state.folder === 'trash';

    var btnGroup1 = '';
    if (isSpam) {
      btnGroup1 = '<span class="bgrp">' +
        '<button type="button" class="gb bold" data-act="delete_forever">Delete forever</button>' +
        '<button type="button" class="gb" data-act="not_spam">Not spam</button>' +
      '</span>';
    } else if (isTrash) {
      btnGroup1 = '<span class="bgrp">' +
        '<button type="button" class="gb bold" data-act="delete_forever">Delete forever</button>' +
        '<button type="button" class="gb" data-act="move_inbox">Move to Inbox</button>' +
      '</span>';
    } else {
      btnGroup1 = '<span class="bgrp">' +
        '<button type="button" class="gb bold" data-act="archive">Archive</button>' +
        '<button type="button" class="gb" data-act="spam">Report spam</button>' +
        '<button type="button" class="gb" data-act="delete">Delete</button>' +
      '</span>';
    }

    var srchBox = '<div class="dd-srch-wrap"><input class="dd-srch" type="text" placeholder="" onclick="event.stopPropagation()"></div>';
    var moveItems = srchBox + '<div class="dd-item" data-move="inbox">Inbox</div>';
    D.labels.forEach(function (lb) {
      moveItems += '<div class="dd-item" data-move="label:' + esc(lb.id) + '">' + esc(lb.name) + '</div>';
    });
    moveItems += '<div class="dd-sep"></div><div class="dd-item" data-move="spam">Spam</div><div class="dd-item" data-move="trash">Trash</div>' +
      '<div class="dd-sep"></div><div class="dd-item" data-act="refresh" style="color:#444">Create new</div><div class="dd-item" data-act="refresh" style="color:#444">Manage labels</div>';

    var lblItems = srchBox;
    D.labels.forEach(function (lb) {
      lblItems += '<div class="dd-item" data-toggle-lbl="' + esc(lb.id) + '"><span class="lbl-swatch" style="background:' + lb.bg + '"></span>' + esc(lb.name) + '</div>';
    });
    lblItems += '<div class="dd-sep"></div><div class="dd-item" data-act="refresh" style="color:#444">Create new</div><div class="dd-item" data-act="refresh" style="color:#444">Manage labels</div>';

    var moreItems =
      '<div class="dd-item" data-act="mark_read">Mark as read</div>' +
      '<div class="dd-item" data-act="mark_unread">Mark as unread</div>' +
      '<div class="dd-item" data-act="add_star">Add star</div>' +
      '<div class="dd-item" data-act="rem_star">Remove star</div>';

    var leftHtml = '';
    if (isConv) {
      leftHtml += '<a href="#" class="tbar-back" data-act="back">&laquo; Back to ' + esc(folderTitle(state.folder)) + '</a>';
    }
    leftHtml += btnGroup1 +
      '<span class="bgrp">' +
        '<span class="dd-wrap"><button type="button" class="gb" data-dd="mv_' + ddId + '">Move to<span class="tri">&#9660;</span></button><div class="dd-menu" id="mv_' + ddId + '">' + moveItems + '</div></span>' +
        '<span class="dd-wrap"><button type="button" class="gb" data-dd="lb_' + ddId + '">Labels<span class="tri">&#9660;</span></button><div class="dd-menu" id="lb_' + ddId + '">' + lblItems + '</div></span>' +
      '</span>' +
      '<span class="dd-wrap"><button type="button" class="gb" data-dd="mr_' + ddId + '">More actions<span class="tri">&#9660;</span></button><div class="dd-menu" id="mr_' + ddId + '">' + moreItems + '</div></span>';
    if (!isConv) {
      leftHtml += '<a href="#" class="tbar-link" data-act="refresh">Refresh</a>';
    }

    var rightHtml = '';
    if (!isConv) {
      var hasNewer = state.page > 0;
      var hasOlder = endIdx < total;
      rightHtml = (total > 0 ? '<b>' + (startIdx + 1) + '</b> - <b>' + endIdx + '</b> of <b>' + total + '</b>' : '0 of 0') +
        (hasNewer ? ' <a href="#" data-page="first">&laquo; Newest</a> <a href="#" data-page="prev">&lsaquo; Newer</a>' : '') +
        (hasOlder ? ' <a href="#" data-page="next">Older &rsaquo;</a> <a href="#" data-page="last">Oldest &raquo;</a>' : '');
    } else {
      var list = filteredThreads();
      var idx = -1;
      for (var i = 0; i < list.length; i++) if (list[i].id === state.activeThreadId) { idx = i; break; }
      if (idx >= 0) {
        rightHtml = '<b>' + (idx + 1) + '</b> of <b>' + list.length + '</b> ' +
          (idx > 0 ? '<a href="#" data-cnav="' + list[idx - 1].id + '">&lsaquo; Newer</a>' : '<span class="dis">&lsaquo; Newer</span>') + ' ' +
          (idx < list.length - 1 ? '<a href="#" data-cnav="' + list[idx + 1].id + '">Older &rsaquo;</a>' : '<span class="dis">Older &rsaquo;</span>');
      }
    }

    var selHtml = !isConv ?
      '<div class="selbar' + (isTop ? '' : ' selbar-bot') + '">Select: ' +
      '<a href="#" data-sel="all">All</a>, ' +
      '<a href="#" data-sel="none">None</a>, ' +
      '<a href="#" data-sel="read">Read</a>, ' +
      '<a href="#" data-sel="unread">Unread</a>, ' +
      '<a href="#" data-sel="starred">Starred</a>, ' +
      '<a href="#" data-sel="unstarred">Unstarred</a></div>' : '';

    var rowHtml = '<div class="tbar-row"><div class="tbar-left">' + leftHtml + '</div><div class="tbar-right">' + rightHtml + '</div></div>';
    return '<div class="' + cls + '">' + (isTop ? rowHtml + selHtml : selHtml + rowHtml) + '</div>';
  }

  function targetIds() {
    if (state.view === 'conv' && state.activeThreadId) return [state.activeThreadId];
    return Object.keys(state.selected).filter(function (k) { return state.selected[k]; });
  }

  function findThread(id) {
    for (var i = 0; i < D.threads.length; i++) if (D.threads[i].id === id) return D.threads[i];
    return null;
  }

  function doAction(act) {
    if (act === 'back') {
      state.view = 'list';
      state.activeThreadId = null;
      renderAll();
      return;
    }
    if (act === 'refresh') {
      showButter('Checking mail... No new messages.');
      return;
    }
    var ids = targetIds();
    if (!ids.length) {
      showButter('No conversations selected.');
      return;
    }
    var affected = ids.map(findThread).filter(Boolean);
    var prev = affected.map(function (t) { return { t: t, folder: t.folder, unread: t.unread, starred: t.starred }; });

    if (act === 'archive') {
      affected.forEach(function (t) { t.folder = 'all'; });
      showButter(affected.length + ' conversation' + (affected.length > 1 ? 's' : '') + ' archived.', function () {
        prev.forEach(function (p) { p.t.folder = p.folder; }); renderAll();
      });
    } else if (act === 'spam') {
      affected.forEach(function (t) { t.folder = 'spam'; });
      showButter(affected.length + ' conversation' + (affected.length > 1 ? 's' : '') + ' marked as spam.', function () {
        prev.forEach(function (p) { p.t.folder = p.folder; }); renderAll();
      });
    } else if (act === 'not_spam' || act === 'move_inbox') {
      affected.forEach(function (t) { t.folder = 'inbox'; });
      showButter('Moved to Inbox.');
    } else if (act === 'delete') {
      affected.forEach(function (t) { t.folder = 'trash'; });
      showButter('The conversation has been moved to the Trash.', function () {
        prev.forEach(function (p) { p.t.folder = p.folder; }); renderAll();
      });
    } else if (act === 'delete_forever') {
      D.threads = D.threads.filter(function (t) { return ids.indexOf(t.id) === -1; });
      showButter('Conversation permanently deleted.');
    } else if (act === 'mark_read') {
      affected.forEach(function (t) { t.unread = false; });
    } else if (act === 'mark_unread') {
      affected.forEach(function (t) { t.unread = true; });
    } else if (act === 'add_star') {
      affected.forEach(function (t) { t.starred = true; });
    } else if (act === 'rem_star') {
      affected.forEach(function (t) { t.starred = false; });
    }
    state.selected = {};
    if (state.view === 'conv' && ['archive', 'spam', 'delete', 'delete_forever', 'not_spam', 'move_inbox'].indexOf(act) !== -1) {
      state.view = 'list';
      state.activeThreadId = null;
    }
    renderAll();
  }

  function bindToolbarEvents(container, pageSlice) {
    container.querySelectorAll('[data-act]').forEach(function (el) {
      el.onclick = function (e) {
        e.preventDefault();
        closeAllDropdowns();
        doAction(el.getAttribute('data-act'));
      };
    });
    container.querySelectorAll('[data-dd]').forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        var id = btn.getAttribute('data-dd');
        var m = document.getElementById(id);
        var wasOpen = m && m.classList.contains('open');
        closeAllDropdowns();
        if (m && !wasOpen) {
          m.classList.add('open');
          btn.classList.add('open');
        }
      };
    });
    container.querySelectorAll('[data-move]').forEach(function (it) {
      it.onclick = function () {
        closeAllDropdowns();
        var ids = targetIds();
        if (!ids.length) return showButter('No conversations selected.');
        var dest = it.getAttribute('data-move');
        ids.map(findThread).filter(Boolean).forEach(function (t) {
          if (dest.indexOf('label:') === 0) {
            var lid = dest.slice(6);
            if (t.labels.indexOf(lid) === -1) t.labels.push(lid);
            t.folder = 'all';
          } else {
            t.folder = dest;
          }
        });
        state.selected = {};
        if (state.view === 'conv') state.view = 'list';
        showButter('Moved ' + ids.length + ' conversation(s).');
        renderAll();
      };
    });
    container.querySelectorAll('[data-toggle-lbl]').forEach(function (it) {
      it.onclick = function () {
        closeAllDropdowns();
        var ids = targetIds();
        if (!ids.length) return showButter('No conversations selected.');
        var lid = it.getAttribute('data-toggle-lbl');
        ids.map(findThread).filter(Boolean).forEach(function (t) {
          var ix = t.labels.indexOf(lid);
          if (ix === -1) t.labels.push(lid); else t.labels.splice(ix, 1);
        });
        showButter('Label "' + lid + '" updated.');
        renderAll();
      };
    });
    container.querySelectorAll('[data-sel]').forEach(function (a) {
      a.onclick = function (e) {
        e.preventDefault();
        var mode = a.getAttribute('data-sel');
        state.selected = {};
        pageSlice.forEach(function (t) {
          if (mode === 'all') state.selected[t.id] = true;
          else if (mode === 'read' && !t.unread) state.selected[t.id] = true;
          else if (mode === 'unread' && t.unread) state.selected[t.id] = true;
          else if (mode === 'starred' && t.starred) state.selected[t.id] = true;
          else if (mode === 'unstarred' && !t.starred) state.selected[t.id] = true;
        });
        renderMain();
      };
    });
    container.querySelectorAll('[data-page]').forEach(function (a) {
      a.onclick = function (e) {
        e.preventDefault();
        var tot = filteredThreads().length;
        var maxP = Math.max(0, Math.ceil(tot / PAGE_SIZE) - 1);
        var p = a.getAttribute('data-page');
        if (p === 'first') state.page = 0;
        else if (p === 'prev') state.page = Math.max(0, state.page - 1);
        else if (p === 'next') state.page = Math.min(maxP, state.page + 1);
        else if (p === 'last') state.page = maxP;
        state.selected = {};
        renderMain();
      };
    });
    container.querySelectorAll('[data-cnav]').forEach(function (a) {
      a.onclick = function (e) {
        e.preventDefault();
        openThread(a.getAttribute('data-cnav'));
      };
    });
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.dd-menu.open').forEach(function (m) { m.classList.remove('open'); });
    document.querySelectorAll('.gb.open').forEach(function (b) { b.classList.remove('open'); });
  }
  document.addEventListener('click', closeAllDropdowns);

  function openThread(id) {
    var th = findThread(id);
    if (!th) return;
    if (th.folder === 'drafts') {
      state.view = 'compose';
      state.draftEdit = th;
      renderAll();
      return;
    }
    th.unread = false;
    state.activeThreadId = id;
    state.view = 'conv';
    state.expandedMsgs = {};
    state.expandedMsgs[th.messages.length - 1] = true;
    renderAll();
    window.scrollTo(0, 0);
  }

  function renderPlainBody(txt) {
    var lines = (txt || '').split('\n');
    var out = [], inQ = false;
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i];
      if (/^>/.test(l)) {
        if (!inQ) { out.push('<div class="msg-quote">'); inQ = true; }
        out.push(esc(l) + '\n');
      } else {
        if (inQ) { out.push('</div>'); inQ = false; }
        out.push(esc(l) + '\n');
      }
    }
    if (inQ) out.push('</div>');
    return '<div class="msg-plain">' + out.join('') + '</div>';
  }

  function renderList() {
    var list = filteredThreads();
    var total = list.length;
    var start = state.page * PAGE_SIZE;
    if (start >= total && state.page > 0) { state.page = 0; start = 0; }
    var end = Math.min(total, start + PAGE_SIZE);
    var slice = list.slice(start, end);

    var html = buildToolbar(true, total, start, end, false);
    if (state.folder === 'spam') {
      html += '<div class="spam-banner">Messages that have been in Spam more than 30 days will be automatically deleted. <a href="#" id="empty-spam">Delete all spam messages now</a></div>';
    } else if (state.folder === 'trash') {
      html += '<div class="spam-banner">Messages that have been in Trash more than 30 days will be automatically deleted. <a href="#" id="empty-trash">Empty Trash now</a></div>';
    } else if (state.folder === 'search') {
      html += '<div class="spam-banner" style="background:#f3f7ff;border-color:#c9d7f1;">Search results for: <b>' + esc(state.searchQuery) + '</b> (' + total + ' matching conversation' + (total === 1 ? '' : 's') + ')</div>';
    }

    if (!slice.length) {
      html += '<div class="empty-box">No conversations in ' + esc(folderTitle(state.folder)) + '.</div>';
    } else {
      html += '<table id="msgtable"><tbody>';
      slice.forEach(function (th) {
        var rcls = 'mr ' + (th.unread ? 'unread' : 'read') + (state.selected[th.id] ? ' selected' : '');
        var pills = '';
        if (state.folder !== 'inbox' && th.folder === 'inbox') {
          pills += '<span class="lbl-pill" style="background:#dddddd;color:#333">Inbox</span>';
        }
        th.labels.forEach(function (lid) {
          if (state.folder === 'label:' + lid) return;
          var lo = getLabelObj(lid);
          pills += '<span class="lbl-pill" style="background:' + lo.bg + ';color:' + lo.fg + '">' + esc(lo.name) + '</span>';
        });
        var att = hasAttachments(th) ? '<img src="' + IMG.paperclip + '" alt="Attachment">' : '';
        html += '<tr class="' + rcls + '" data-tid="' + th.id + '">' +
          '<td class="col-grip"><span class="grip"></span></td>' +
          '<td class="col-chk"><input type="checkbox" data-chk="' + th.id + '"' + (state.selected[th.id] ? ' checked' : '') + '></td>' +
          '<td class="col-star"><img src="' + (th.starred ? IMG.star_on : IMG.star_off) + '" data-star="' + th.id + '" alt="Star"></td>' +
          '<td class="col-from">' + formatSenderCell(th) + '</td>' +
          '<td class="col-subj">' + pills + '<span class="subj-txt">' + esc(th.subject) + '</span><span class="snip-txt"> - ' + esc(th.snippet) + '</span></td>' +
          '<td class="col-att">' + att + '</td>' +
          '<td class="col-date">' + esc(th.date_list) + '</td>' +
        '</tr>';
      });
      html += '</tbody></table>';
    }
    html += buildToolbar(false, total, start, end, false);

    var pane = document.getElementById('pane');
    pane.innerHTML = html;
    bindToolbarEvents(pane, slice);

    var es = document.getElementById('empty-spam');
    if (es) es.onclick = function (e) { e.preventDefault(); D.threads = D.threads.filter(function (t) { return t.folder !== 'spam'; }); showButter('All spam messages deleted.'); renderAll(); };
    var et = document.getElementById('empty-trash');
    if (et) et.onclick = function (e) { e.preventDefault(); D.threads = D.threads.filter(function (t) { return t.folder !== 'trash'; }); showButter('Trash emptied.'); renderAll(); };

    pane.querySelectorAll('tr.mr').forEach(function (tr) {
      tr.onclick = function (e) {
        if (e.target.tagName === 'INPUT' || e.target.getAttribute('data-star')) return;
        openThread(tr.getAttribute('data-tid'));
      };
    });
    pane.querySelectorAll('input[data-chk]').forEach(function (chk) {
      chk.onclick = function (e) {
        e.stopPropagation();
        var id = chk.getAttribute('data-chk');
        state.selected[id] = chk.checked;
        chk.closest('tr').classList.toggle('selected', chk.checked);
      };
    });
    pane.querySelectorAll('img[data-star]').forEach(function (st) {
      st.onclick = function (e) {
        e.stopPropagation();
        var t = findThread(st.getAttribute('data-star'));
        if (!t) return;
        t.starred = !t.starred;
        renderMain();
      };
    });
  }

  function renderConv() {
    var th = findThread(state.activeThreadId);
    if (!th) { state.view = 'list'; renderList(); return; }

    var html = buildToolbar(true, 0, 0, 0, true);

    // Removable label chips on conversation subject line (exact match to ref_better_labels.png!)
    var chips = '';
    if (th.folder === 'inbox') {
      chips += '<span class="conv-lbl" style="background:#dddddd;color:#333"><span class="ln">Inbox</span><span class="lx" data-reminbox="1">&times;</span></span>';
    }
    th.labels.forEach(function (lid) {
      var lo = getLabelObj(lid);
      chips += '<span class="conv-lbl" style="background:' + lo.bg + ';color:' + lo.fg + '"><span class="ln">' + esc(lo.name) + '</span><span class="lx" data-remlbl="' + esc(lid) + '">&times;</span></span>';
    });

    var senderColMap = {}, nextC = 0;
    function colorFor(name) {
      if (!senderColMap[name]) senderColMap[name] = SENDER_COLORS[nextC++ % SENDER_COLORS.length];
      return senderColMap[name];
    }

    var msgsHtml = '';
    th.messages.forEach(function (m, idx) {
      var col = colorFor(m.sender_name);
      var isExp = !!state.expandedMsgs[idx];
      if (!isExp) {
        var snip = (m.body || '').replace(/\s+/g, ' ').trim().slice(0, 78);
        msgsHtml += '<div class="msg-collapsed" data-exp="' + idx + '">' +
          '<div class="msg-collapsed-left">' +
            '<img src="' + (th.starred ? IMG.star_on : IMG.star_off) + '" width="15" height="15" alt="">' +
            '<b style="color:' + col + '">' + esc(m.sender_name) + '</b>' +
            '<span class="msg-collapsed-snip">' + esc(snip) + '</span>' +
          '</div>' +
          '<span class="msg-collapsed-date">' + esc(m.date_full.split(' at ')[0]) + '</span>' +
        '</div>';
        return;
      }

      var detOpen = !!state.detailsOpen[th.id + '_' + idx];
      var detHtml = '';
      if (detOpen) {
        detHtml = '<div class="msg-details-tbl"><table>' +
          '<tr><td class="dk">from</td><td class="dv"><b style="color:' + col + '">' + esc(m.sender_name) + '</b> &lt;' + esc(m.sender_email) + '&gt;</td></tr>' +
          '<tr><td class="dk">to</td><td class="dv">' + esc(m.to_str || D.userEmail) + '</td></tr>' +
          '<tr><td class="dk">date</td><td class="dv">' + esc(m.date_full) + '</td></tr>' +
          '<tr><td class="dk">subject</td><td class="dv">' + esc(th.subject) + '</td></tr>' +
          (m.mailed_by ? '<tr><td class="dk">mailed-by</td><td class="dv">' + esc(m.mailed_by) + '</td></tr>' : '') +
          (m.signed_by ? '<tr><td class="dk">signed-by</td><td class="dv">' + esc(m.signed_by) + '</td></tr>' : '') +
        '</table></div>';
      }

      var blockBar = '';
      var bodyHtml = '';
      var imgKey = th.id + '_' + idx;
      if (m.html_body) {
        if (m.has_blocked_images && !state.imagesShown[imgKey]) {
          blockBar = '<div class="img-block-bar">Images are not displayed. <a href="#" data-showimg="' + imgKey + '">Display images below</a> - <a href="#" data-showimg="' + imgKey + '">Always display images from ' + esc(m.sender_email) + '</a></div>';
          bodyHtml = m.html_body.replace(/<img\s+[^>]*data-blocked-src="[^"]+"[^>]*>/gi, function (tag) {
            var altM = tag.match(/alt="([^"]*)"/i);
            var alt = altM ? altM[1] : 'Blocked image';
            return '<div style="border:1px dashed #b5b5b5;background:#f7f7f7;padding:18px 12px;text-align:center;color:#777;font:11px Arial,sans-serif;margin:6px auto;max-width:440px;">[ Image blocked for your privacy: ' + esc(alt) + ' ]</div>';
          });
        } else {
          bodyHtml = m.html_body.replace(/data-blocked-src="/g, 'src="');
        }
      } else {
        bodyHtml = renderPlainBody(m.body);
      }

      var attHtml = '';
      if (m.attachments && m.attachments.length) {
        attHtml = '<div class="msg-att-box">';
        m.attachments.forEach(function (a, ai) {
          var thumb = '';
          if (a.kind === 'img' && a.img && IMG[a.img]) {
            thumb = '<img class="att-thumb" src="' + IMG[a.img] + '" data-lb="' + a.img + '" data-lbname="' + esc(a.name) + '" alt="' + esc(a.name) + '">';
          } else {
            thumb = '<img src="' + IMG.paperclip + '" width="15" height="15" style="margin-top:2px" alt="">';
          }
          attHtml += '<div class="att-item">' + thumb +
            '<div class="att-meta"><b>' + esc(a.name) + '</b><span class="asz">' + esc(a.size) + '</span>' +
            '<div class="alinks">' +
              (a.kind === 'img' && a.img ? '<a href="#" data-lb="' + a.img + '" data-lbname="' + esc(a.name) + '">View</a>' : '<a href="#" data-fakeatt="' + esc(a.name) + '">View</a>') +
              '<a href="#" data-fakeatt="' + esc(a.name) + '">Download</a>' +
            '</div></div></div>';
        });
        attHtml += '</div>';
      }

      msgsHtml += '<div class="msg-card">' +
        '<div class="msg-hdr">' +
          '<div class="msg-hdr-left">' +
            '<img class="mstar" src="' + (th.starred ? IMG.star_on : IMG.star_off) + '" data-cstar="1" alt="Star">' +
            '<span class="msg-sender" style="color:' + col + '">' + esc(m.sender_name) + '</span>' +
            '<span class="msg-to">to ' + esc(m.is_me ? (m.to_str || '').split('<')[0].trim() : 'me') + '</span>' +
          '</div>' +
          '<div class="msg-hdr-right">' +
            '<a href="#" data-det="' + imgKey + '">' + (detOpen ? 'hide details' : 'show details') + '</a>' +
            '<span>' + esc(m.date_full.replace(/^[A-Za-z]+,\s*/, '').replace(/, 2009 at /, ' ')) + ' (' + esc(m.age_str) + ')</span>' +
            '<span class="bgrp"><button type="button" class="gb" data-reply="' + idx + '">&#8617; Reply</button><button type="button" class="gb" data-reply="' + idx + '" style="padding:0 5px">&#9662;</button></span>' +
          '</div>' +
        '</div>' +
        detHtml +
        blockBar +
        '<div class="msg-body">' + bodyHtml + '</div>' +
        attHtml +
        '<div class="msg-foot"><a href="#" data-reply="' + idx + '">Reply</a> | <a href="#" data-reply="' + idx + '">Reply to all</a> | <a href="#" data-fwd="' + idx + '">Forward</a></div>' +
      '</div>';
    });

    // Right sidebar: Expand all, Print all, New window + Contextual 2009 Sponsored Links
    var allExp = th.messages.every(function (_, i) { return !!state.expandedMsgs[i]; });
    var ads = D.adSets[th.ad_cat] || D.adSets['default'];
    var adsHtml = '<div class="ads-hdr">Sponsored Links</div>';
    ads.forEach(function (ad) {
      adsHtml += '<div class="ad-item"><a href="#" class="ad-t" onclick="return false;">' + esc(ad[0]) + '</a><div class="ad-d">' + esc(ad[1]) + '</div><div class="ad-u">' + esc(ad[2]) + '</div></div>';
    });
    adsHtml += '<div class="ads-about"><a href="#" onclick="return false;" style="color:#777">About these links</a></div>';

    var sideHtml = '<div id="conv-side">' +
      '<div class="cside-acts">' +
        (th.messages.length > 1 ? '<div class="cside-act" id="act-expall"><img src="' + (allExp ? IMG.collapse : IMG.expand) + '" alt=""><span>' + (allExp ? 'Collapse all' : 'Expand all') + '</span></div>' : '') +
        '<div class="cside-act" id="act-print"><img src="' + IMG.print + '" alt=""><span>Print all</span></div>' +
        '<div class="cside-act" id="act-newwin"><img src="' + IMG.tearoff + '" alt=""><span>New window</span></div>' +
      '</div>' +
      adsHtml +
    '</div>';

    html += '<div id="conv-wrap"><div id="conv-main"><div id="conv-subj-row"><h2 id="conv-subj">' + esc(th.subject) + '</h2>' + chips + '</div>' + msgsHtml + '<div id="reply-slot"></div></div>' + sideHtml + '</div>';
    html += buildToolbar(false, 0, 0, 0, true);

    var pane = document.getElementById('pane');
    pane.innerHTML = html;
    bindToolbarEvents(pane, []);

    pane.querySelectorAll('[data-exp]').forEach(function (el) {
      el.onclick = function () { state.expandedMsgs[+el.getAttribute('data-exp')] = true; renderMain(); };
    });
    pane.querySelectorAll('[data-det]').forEach(function (a) {
      a.onclick = function (e) { e.preventDefault(); var k = a.getAttribute('data-det'); state.detailsOpen[k] = !state.detailsOpen[k]; renderMain(); };
    });
    pane.querySelectorAll('[data-showimg]').forEach(function (a) {
      a.onclick = function (e) { e.preventDefault(); state.imagesShown[a.getAttribute('data-showimg')] = true; renderMain(); };
    });
    pane.querySelectorAll('[data-cstar]').forEach(function (s) {
      s.onclick = function () { th.starred = !th.starred; renderMain(); };
    });
    pane.querySelectorAll('[data-reminbox]').forEach(function (x) {
      x.onclick = function () { doAction('archive'); };
    });
    pane.querySelectorAll('[data-remlbl]').forEach(function (x) {
      x.onclick = function () {
        var lid = x.getAttribute('data-remlbl');
        th.labels = th.labels.filter(function (l) { return l !== lid; });
        renderAll();
      };
    });
    pane.querySelectorAll('[data-lb]').forEach(function (el) {
      el.onclick = function (e) {
        e.preventDefault();
        var k = el.getAttribute('data-lb');
        document.getElementById('lb-img').src = IMG[k];
        document.getElementById('lb-name').textContent = el.getAttribute('data-lbname') || 'Attachment';
        document.getElementById('lightbox').classList.add('open');
      };
    });
    pane.querySelectorAll('[data-fakeatt]').forEach(function (a) {
      a.onclick = function (e) { e.preventDefault(); showButter('Attachment "' + a.getAttribute('data-fakeatt') + '" scanned with Gmail anti-virus — no threats found.'); };
    });
    var ea = document.getElementById('act-expall');
    if (ea) ea.onclick = function () {
      var target = !allExp;
      th.messages.forEach(function (_, i) { state.expandedMsgs[i] = target; });
      if (!target) state.expandedMsgs[th.messages.length - 1] = true;
      renderMain();
    };
    var pr = document.getElementById('act-print');
    if (pr) pr.onclick = function () { try { window.print(); } catch (_) {} };
    var nw = document.getElementById('act-newwin');
    if (nw) nw.onclick = function () { showButter('Pop-up blocked by browser settings.'); };

    pane.querySelectorAll('[data-reply],[data-fwd]').forEach(function (el) {
      el.onclick = function (e) {
        e.preventDefault();
        var isFwd = el.hasAttribute('data-fwd');
        var mi = +(isFwd ? el.getAttribute('data-fwd') : el.getAttribute('data-reply'));
        var m = th.messages[mi];
        var slot = document.getElementById('reply-slot');
        slot.innerHTML = '<div class="reply-box">' +
          '<div style="font:bold 12px Arial;margin-bottom:4px;">' + (isFwd ? 'Forward' : 'Reply to ' + esc(m.sender_name) + ' &lt;' + esc(m.sender_email) + '&gt;') + '</div>' +
          (isFwd ? '<div style="margin-bottom:4px;">To: <input id="rf-to" type="text" style="width:280px;font:12px Arial;border:1px solid #7f9db9;padding:2px"></div>' : '') +
          '<textarea id="rf-txt">' + (isFwd ? '\n\n---------- Forwarded message ----------\nFrom: ' + m.sender_name + ' <' + m.sender_email + '>\nDate: ' + m.date_full + '\nSubject: ' + th.subject + '\n\n' + (m.body || '') : '') + '</textarea>' +
          '<div><button type="button" class="gb bold" id="rf-send">Send</button> <button type="button" class="gb" id="rf-discard">Discard</button></div>' +
        '</div>';
        document.getElementById('rf-txt').focus();
        document.getElementById('rf-discard').onclick = function () { slot.innerHTML = ''; };
        document.getElementById('rf-send').onclick = function () {
          var body = (document.getElementById('rf-txt').value || '').trim();
          if (!body) return showButter('Please write a message before sending.');
          th.messages.push({
            sender_name: D.userName,
            sender_email: D.userEmail,
            is_me: true,
            to_str: isFwd ? ((document.getElementById('rf-to') && document.getElementById('rf-to').value) || 'recipient@gmail.com') : (m.sender_name + ' <' + m.sender_email + '>'),
            date_full: 'Thu, Nov 5, 2009 at 4:32 PM',
            age_str: '0 minutes ago',
            mailed_by: 'gmail.com',
            body: body
          });
          th.date_list = '4:32 pm';
          state.expandedMsgs[th.messages.length - 1] = true;
          showButter('Your message has been sent.');
          renderAll();
        };
      };
    });
  }

  function renderCompose() {
    var d = state.draftEdit;
    var toVal = d ? (d.messages[0].to_str || '') : '';
    var subjVal = d ? (d.subject || '') : '';
    var bodyVal = d ? (d.messages[0].body || '') : '';

    var bar = '<div class="tbar tbar-top"><div class="tbar-row"><div class="tbar-left">' +
      '<button type="button" class="gb bold" id="c-send">Send</button>' +
      '<button type="button" class="gb" id="c-save">Save Now</button>' +
      '<button type="button" class="gb" id="c-disc">Discard</button>' +
      '</div></div></div>';

    var form = '<div id="compose-wrap"><table class="comp-table">' +
      '<tr><td class="ck">From:</td><td class="cv">' + esc(D.userName) + ' &lt;' + esc(D.userEmail) + '&gt;</td></tr>' +
      '<tr><td class="ck">To:</td><td class="cv"><input type="text" id="comp-to" value="' + esc(toVal) + '"></td></tr>' +
      '<tr><td class="ck">Subject:</td><td class="cv"><input type="text" id="comp-subj" value="' + esc(subjVal) + '"></td></tr>' +
      '<tr><td class="ck"></td><td class="cv"><a href="#" id="comp-att" style="font-size:12px;">Attach a file</a></td></tr>' +
      '<tr><td class="ck"></td><td class="cv">' +
        '<div class="comp-rtbar"><b>B</b> <i>I</i> <u>U</u> <span style="font-family:serif">F</span> <span>TT</span> <span>&bull;</span> <span>1.</span> <a href="#" style="font:11px Arial;margin-left:auto" onclick="return false;">&laquo; Plain Text</a></div>' +
        '<textarea id="comp-body">' + esc(bodyVal) + '</textarea>' +
      '</td></tr>' +
    '</table></div>';

    var pane = document.getElementById('pane');
    pane.innerHTML = bar + form;
    document.getElementById('comp-att').onclick = function (e) { e.preventDefault(); showButter('File attachment dialog is disabled in offline archive preview.'); };
    document.getElementById('c-disc').onclick = function () {
      state.draftEdit = null;
      state.view = 'list';
      showButter('Your message has been discarded.');
      renderAll();
    };
    document.getElementById('c-save').onclick = function () {
      var to = (document.getElementById('comp-to').value || '').trim();
      var subj = (document.getElementById('comp-subj').value || '').trim() || '(no subject)';
      var body = document.getElementById('comp-body').value || '';
      if (d) {
        d.subject = subj;
        d.snippet = body.replace(/\s+/g, ' ').slice(0, 100);
        d.messages[0].to_str = to;
        d.messages[0].body = body;
      } else {
        D.threads.unshift({
          id: 'draft_' + Date.now(),
          folder: 'drafts',
          unread: false,
          starred: false,
          labels: [],
          ad_cat: 'default',
          subject: subj,
          date_list: '4:32 pm',
          snippet: body.replace(/\s+/g, ' ').slice(0, 100),
          messages: [{ sender_name: 'Draft', sender_email: D.userEmail, is_me: true, is_draft: true, to_str: to, date_full: 'Thu, Nov 5, 2009 at 4:32 PM (Draft)', age_str: '0 minutes ago', body: body }]
        });
      }
      state.draftEdit = null;
      state.view = 'list';
      showButter('Your message has been saved to Drafts.');
      renderAll();
    };
    document.getElementById('c-send').onclick = function () {
      var to = (document.getElementById('comp-to').value || '').trim();
      if (!to) return showButter('Please specify at least one recipient.');
      var subj = (document.getElementById('comp-subj').value || '').trim() || '(no subject)';
      var body = document.getElementById('comp-body').value || '';
      if (d) D.threads = D.threads.filter(function (x) { return x.id !== d.id; });
      D.threads.unshift({
        id: 'sent_' + Date.now(),
        folder: 'sent',
        unread: false,
        starred: false,
        labels: [],
        ad_cat: 'default',
        subject: subj,
        date_list: '4:32 pm',
        snippet: body.replace(/\s+/g, ' ').slice(0, 100),
        messages: [{ sender_name: D.userName, sender_email: D.userEmail, is_me: true, to_str: to, date_full: 'Thu, Nov 5, 2009 at 4:32 PM', age_str: '0 minutes ago', mailed_by: 'gmail.com', body: body }]
      });
      state.draftEdit = null;
      state.view = 'list';
      showButter('Your message has been sent.');
      renderAll();
    };
  }

  function renderMain() {
    if (state.view === 'compose') renderCompose();
    else if (state.view === 'conv') renderConv();
    else renderList();
  }

  function renderAll() {
    syncTitle();
    renderWebClip();
    renderLeftNav();
    renderMain();
  }

  function openChatPop(name) {
    state.activeChat = name;
    var pop = document.getElementById('chat-pop');
    document.getElementById('chat-pop-name').textContent = name;
    var log = document.getElementById('chat-pop-log');
    var msgs = state.chatHistory[name] || [{ who: 'sys', txt: 'Chat with ' + name + ' started.' }];
    state.chatHistory[name] = msgs;
    log.innerHTML = msgs.map(function (m) {
      if (m.who === 'sys') return '<div style="color:#777;font-style:italic;margin-bottom:5px;">' + esc(m.txt) + '</div>';
      return '<div style="margin-bottom:4px;"><b style="color:' + (m.who === 'me' ? '#2a5db0' : '#00681c') + '">' + esc(m.who) + ':</b> ' + esc(m.txt) + '</div>';
    }).join('');
    pop.classList.add('open');
    log.scrollTop = log.scrollHeight;
    document.getElementById('chat-pop-in').focus();
  }

  // Wire global header & widgets
  document.getElementById('logo-img').onclick = function () {
    state.folder = 'inbox'; state.view = 'list'; state.page = 0; state.selected = {}; state.searchQuery = '';
    document.getElementById('sq').value = '';
    renderAll();
  };
  document.getElementById('searchform').onsubmit = function (e) {
    e.preventDefault();
    state.searchQuery = document.getElementById('sq').value || '';
    state.folder = state.searchQuery.trim() ? 'search' : 'inbox';
    state.view = 'list';
    state.page = 0;
    state.selected = {};
    renderAll();
  };
  document.getElementById('sweb-btn').onclick = function () {
    showButter('Web search redirected — see FCC Directive 09-4A notice on Google.com.');
  };
  document.getElementById('wc-prev').onclick = function (e) { e.preventDefault(); state.webClipIdx = (state.webClipIdx - 1 + D.webClips.length) % D.webClips.length; renderWebClip(); };
  document.getElementById('wc-next').onclick = function (e) { e.preventDefault(); state.webClipIdx = (state.webClipIdx + 1) % D.webClips.length; renderWebClip(); };
  document.getElementById('chat-pop-x').onclick = function () { document.getElementById('chat-pop').classList.remove('open'); };
  document.getElementById('chat-pop-in').onkeydown = function (e) {
    if (e.key !== 'Enter') return;
    var v = this.value.trim();
    if (!v || !state.activeChat) return;
    this.value = '';
    state.chatHistory[state.activeChat].push({ who: 'me', txt: v });
    if (state.activeChat === 'Uncle Ray') {
      state.chatHistory[state.activeChat].push({ who: 'sys', txt: 'Message could not be delivered immediately (user offline).' });
    }
    openChatPop(state.activeChat);
  };
  document.getElementById('lightbox').onclick = function (e) {
    if (e.target.id === 'lightbox' || e.target.id === 'lb-close') document.getElementById('lightbox').classList.remove('open');
  };
  document.querySelectorAll('#gbar a, #guser a, #slinks a, #gfoot a').forEach(function (a) {
    a.onclick = function (e) {
      e.preventDefault();
      var txt = (a.textContent || '').trim();
      if (txt === 'Settings') showButter('Gmail Settings — Theme: Classic Blue (Default) | Labs: Offline, Inserting Images.');
      else if (txt === 'Details') showButter('Last account activity: Nov 5, 2009 4:14 PM PST — Browser (Chrome) — Sacramento, CA (71.198.44.112).');
      else if (txt === 'Sign out') showButter('Signed in as bmiller79@gmail.com.');
    };
  });

  renderAll();
})();
"""

HTML_TPL = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Gmail - Inbox (14) - bmiller79@gmail.com</title>
<link rel="icon" type="image/png" href="__FAV__">
<style>__CSS__</style>
</head>
<body>
<div id="gtop">
  <div id="gbar">
    <b>Gmail</b>
    <a href="#">Calendar</a>
    <a href="#">Documents</a>
    <a href="#">Photos</a>
    <a href="#">Reader</a>
    <a href="#">Web</a>
    <a href="#" class="gb3"><u>more</u> <small>&#9660;</small></a>
  </div>
  <div id="guser">
    <b>bmiller79@gmail.com</b>
    <span class="sep">|</span>
    <img class="labs" src="__LABS__" alt="Labs" title="Gmail Labs">
    <span class="sep">|</span>
    <a href="#">Settings</a>
    <span class="sep">|</span>
    <a href="#">Older version</a>
    <span class="sep">|</span>
    <a href="#">Help</a>
    <span class="sep">|</span>
    <a href="#">Sign out</a>
  </div>
</div>

<div id="headrow">
  <div id="logocol"><img id="logo-img" src="__LOGO__" width="143" height="59" alt="Gmail by Google"></div>
  <div id="searchcol">
    <form id="searchform">
      <input id="sq" type="text" autocomplete="off" value="">
      <button type="submit" class="gbtn-native">Search Mail</button>
      <button type="button" class="gbtn-native" id="sweb-btn">Search the Web</button>
      <div id="slinks">
        <a href="#">Show search options</a>
        <a href="#">Create a filter</a>
      </div>
    </form>
  </div>
  <div id="butterbar-wrap"><span id="butterbar"></span></div>
</div>

<div id="workspace">
  <div id="leftnav"></div>
  <div id="maincol">
    <div id="blueframe">
      <div id="webclip">
        <div id="webclip-text"></div>
        <div id="webclip-nav"><a href="#" id="wc-prev" title="Previous">&lt;</a><a href="#" id="wc-next" title="Next">&gt;</a></div>
      </div>
      <div id="pane"></div>
    </div>
    <div id="gfoot">
      <div class="f-tip"><b>Tip:</b> Want to check Gmail when your internet drops? Turn on Offline Gmail under Settings &gt; Labs.</div>
      <div><span class="f-quota">You are currently using 412 MB (5%) of your 7378 MB.</span></div>
      <div class="f-act">Last account activity: 18 minutes ago at this IP (71.198.44.112). <a href="#">Details</a></div>
      <div class="f-links">Gmail view: <b>standard</b> | <a href="#">turn off chat</a> | <a href="#">older version</a> | <a href="#">basic HTML</a> &nbsp;<a href="#">Learn more</a></div>
      <div class="f-links">&copy;2009 Google - <a href="#">Terms</a> - <a href="#">Privacy Policy</a> - <a href="#">Program Policies</a> - <a href="#">Google Home</a></div>
    </div>
  </div>
</div>

<div id="chat-pop">
  <div id="chat-pop-hdr"><span id="chat-pop-name">Chat</span><span class="cx" id="chat-pop-x">&times;</span></div>
  <div id="chat-pop-log"></div>
  <input id="chat-pop-in" type="text" placeholder="Type a message and press Enter...">
</div>

<div id="lightbox">
  <div id="lightbox-box">
    <img id="lb-img" src="" alt="">
    <div id="lightbox-cap"><span id="lb-name"></span><a href="#" id="lb-close" onclick="return false;">Close [x]</a></div>
  </div>
</div>

<script>window.GMAIL_DATA = __DATA__;</script>
<script>__JS__</script>
</body>
</html>
"""

html = (
    HTML_TPL
    .replace('__FAV__', IMG['fav'])
    .replace('__CSS__', CSS)
    .replace('__LABS__', IMG['labs'])
    .replace('__LOGO__', IMG['logo'])
    .replace('__DATA__', json.dumps(DATA_PAYLOAD, ensure_ascii=False).replace('</', '<\\/'))
    .replace('__JS__', JS)
)

preview_path = os.path.join(HERE, 'gmail_preview.html')
open(preview_path, 'w', encoding='utf-8').write(html)

TITLE = 'Gmail - Inbox (14) - bmiller79@gmail.com'
out_js_path = os.path.join(HERE, '..', '..', 'gmailpage.js')
js_wrapper = (
    '// gmailpage.js — generated by sites/gmail/mkgmail.py: late-2009 Gmail replica (Nov 5, 2009, bmiller79@gmail.com)\n'
    '(function () {\n'
    '  window.GMAIL_FAV = ' + json.dumps(IMG['fav']) + ';\n'
    '  var SRC = ' + json.dumps(html).replace('</', '<\\/') + ';\n'
    '  (window.CWSITES = window.CWSITES || {}).gmail = function (W) {\n'
    '    var ifr = document.createElement(\'iframe\');\n'
    '    ifr.setAttribute(\'title\', \'Gmail\');\n'
    '    ifr.srcdoc = SRC;\n'
    '    var tab = W.open({ title: ' + json.dumps(TITLE) + ', fav: window.GMAIL_FAV, host: \'mail.google.com\', path: \'/mail/#inbox\', node: ifr });\n'
    '    window.addEventListener(\'message\', function (e) {\n'
    '      if (e.source === ifr.contentWindow && e.data && e.data.gmailTitle) {\n'
    '        tab.title = e.data.gmailTitle;\n'
    '        var tt = tab.tab && tab.tab.querySelector(\'.tt\');\n'
    '        if (tt) tt.textContent = tab.title;\n'
    '      }\n'
    '    });\n'
    '    return tab;\n'
    '  };\n'
    '})();\n'
)
open(out_js_path, 'w', encoding='utf-8').write(js_wrapper)
print('Wrote', preview_path, len(html), 'bytes and', out_js_path, len(js_wrapper), 'bytes')
