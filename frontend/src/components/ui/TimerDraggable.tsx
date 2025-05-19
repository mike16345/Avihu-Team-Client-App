import { useTimerStore } from "@/store/timerStore";
import { ConditionalRender } from "./ConditionalRender";
import Draggable from "./Draggable";
import RestTimer from "../WorkoutPlan/RestTimer";

const TimerDraggable = () => {
  const { countdown, stopCountdown } = useTimerStore();

  return (
    <ConditionalRender
      condition={countdown}
      children={
        <Draggable onDropInCircle={() => stopCountdown()} width={110} children={<RestTimer />} />
      }
    />
  );
};

export default TimerDraggable;
