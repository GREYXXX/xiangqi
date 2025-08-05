from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any

from agents.random_agent import RandomAgent
from agents.minimax_agent import MinimaxAgent
from agents.elephant_fish_agent import ElephantFishAgent
from agents.elephant_fish_exact_agent import ElephantFishExactAgent
from agents.base_agent import BaseAgent
from logic.evaluation import evaluate_board

app = FastAPI()

# --- Agent Management ---
AGENTS: Dict[str, BaseAgent] = {
    "Random": RandomAgent(color='black'), # Assuming computer plays black for now
    "Minimax (Expert)": MinimaxAgent(
        color='black', 
        time_limit_secs=1,
        evaluation_fn=evaluate_board
    ),
    "Elephant Fish": ElephantFishAgent(
        color='black',
        time_limit_secs=3
    ),
    "Elephant Fish (Exact)": ElephantFishExactAgent(
        color='black',
        time_limit_secs=3
    ),
}

# We can dynamically set the agent's color later if needed
def set_agent_color(color: str):
    for agent in AGENTS.values():
        agent.color = color

# --- Models ---
class MoveRequest(BaseModel):
    board_state: Dict[str, Any]
    agent_name: str

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/agents")
def get_agents():
    """Returns a list of available agent names."""
    return {"agents": list(AGENTS.keys())}

@app.get("/")
def read_root():
    return {"message": "Welcome to the Xiangqi API"}

# Placeholder for a future endpoint to get a move from an agent
@app.post("/get_move")
async def get_move(request: MoveRequest):
    """
    Receives the current board state and returns the agent's next move.
    """
    agent_name = request.agent_name
    board_state = request.board_state
    
    agent = AGENTS.get(agent_name)

    if not agent:
        return {"error": "Invalid agent name"}, 400
    
    # Ensure agent is playing the correct color for the turn
    agent.color = board_state.get('turn', 'black')

    move = agent.get_move(board_state)
    
    return {"move": move}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 