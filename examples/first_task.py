from hapti import Hapti

hapti = Hapti()  # reads HAPTI_API_KEY

task = hapti.tasks.run(
    {"url": "https://en.wikipedia.org", "goal": "Find the year Ada Lovelace was born."},
    on_step=lambda step: print("step:", step.get("summary")),
)

print(task["status"], (task.get("result") or {}).get("answer"))
