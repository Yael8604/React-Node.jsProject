import React, { type ReactElement } from "react";
import {
  ActivitySquare,
  Brain,
  Eye,
  Ruler,
  MessageSquareText,
} from "lucide-react";

const IconMap: Record<string, ReactElement> = {
  technicalAbility: <ActivitySquare className="w-6 h-6 text-indigo-600" />,
  logicalReasoning: <Brain className="w-6 h-6 text-pink-600" />,
  spatialReasoning: <Eye className="w-6 h-6 text-yellow-600" />,
  quantitativeReasoning: <Ruler className="w-6 h-6 text-green-600" />,
  verbalReasoning: <MessageSquareText className="w-6 h-6 text-blue-600" />,
};

export default IconMap;

