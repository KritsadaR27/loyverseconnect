//frontend/app/settings/linenotification/edit/[id]/page.js
"use client";

import React from 'react';
import { use } from "react";

import LineNotificationEditPage from "../../../linenotification/LineNotificationEditPage";

export default function Page({ params }) {
  const { id } = use(params); // ✅ unwrap

  return <LineNotificationEditPage id={id} />;
}