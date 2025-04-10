"use client";

import React from 'react';
import LineNotificationEditPage from "../../../LineNotificationEditPage";

export default function Page({ params }) {
  return <LineNotificationEditPage id={params.id} />;
}