import type { ContractTemplate, TemplateCategory, TemplateDifficulty } from '@/types'

// ─── Templates ────────────────────────────────────────────────────────────────

export const TEMPLATES: ContractTemplate[] = [
  // ── 1. Hello World ─────────────────────────────────────────────────────────
  {
    id: 'hello-world',
    name: 'Hello World',
    description: 'The simplest possible Intelligent Contract. Stores and retrieves a greeting string.',
    category: 'example',
    difficulty: 'beginner',
    tags: ['starter', 'string', 'read', 'write'],
    source: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

class HelloWorld(gl.Contract):
    greeting: str

    def __init__(self, initial_greeting: str):
        self.greeting = initial_greeting

    @gl.public.view
    def get_greeting(self) -> str:
        return self.greeting

    @gl.public.write
    def set_greeting(self, new_greeting: str):
        self.greeting = new_greeting
`,
  },

  // ── 2. Simple Counter ───────────────────────────────────────────────────────
  {
    id: 'simple-counter',
    name: 'Simple Counter',
    description: 'Increment, decrement, and reset a counter. The most minimal stateful contract with no LLM.',
    category: 'example',
    difficulty: 'beginner',
    tags: ['starter', 'state', 'counter', 'no-llm'],
    source: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

class SimpleCounter(gl.Contract):
    count: int
    owner: str

    def __init__(self, start: int):
        self.count = start
        self.owner = gl.message.sender_address.as_hex

    @gl.public.view
    def get_count(self) -> int:
        return self.count

    @gl.public.write
    def increment(self):
        self.count += 1

    @gl.public.write
    def decrement(self):
        if self.count > 0:
            self.count -= 1

    @gl.public.write
    def reset(self):
        if gl.message.sender_address.as_hex != self.owner:
            raise Exception("Only the owner can reset the counter.")
        self.count = 0
`,
  },

  // ── 3. Key-Value Store ──────────────────────────────────────────────────────
  {
    id: 'key-value-store',
    name: 'Key-Value Store',
    description: 'A simple on-chain key-value store. Set and get arbitrary string values by key.',
    category: 'utility',
    difficulty: 'beginner',
    tags: ['storage', 'map', 'no-llm', 'utility'],
    source: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

class KeyValueStore(gl.Contract):
    store: TreeMap[str, str]
    owner: str

    def __init__(self):
        self.owner = gl.message.sender_address.as_hex

    @gl.public.write
    def set(self, key: str, value: str):
        if gl.message.sender_address.as_hex != self.owner:
            raise Exception("Only the owner can write to this store.")
        self.store[key] = value

    @gl.public.view
    def get(self, key: str) -> str:
        return self.store.get(key, "")

    @gl.public.view
    def has(self, key: str) -> bool:
        return key in self.store

    @gl.public.write
    def delete(self, key: str):
        if gl.message.sender_address.as_hex != self.owner:
            raise Exception("Only the owner can delete keys.")
        if key in self.store:
            del self.store[key]
`,
  },

  // ── 4. Wizard of Coin ───────────────────────────────────────────────────────
  {
    id: 'wizard-of-coin',
    name: 'Wizard of Coin',
    description: 'An LLM-powered wizard who guards a magical coin and decides whether to give it away based on how you ask.',
    category: 'example',
    difficulty: 'intermediate',
    tags: ['llm', 'gl.nondet', 'decision', 'game', 'official-example'],
    source: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

class WizardOfCoin(gl.Contract):
    have_coin: bool

    def __init__(self, have_coin: bool):
        self.have_coin = have_coin

    @gl.public.write
    def ask_for_coin(self, request: str) -> None:
        if not self.have_coin:
            return

        prompt = f"""You are a wizard who guards a magical coin.
Your task is to decide if you should give it away based on the adventurer's request.
You never give the coin to anyone who asks directly or aggressively.

Adventurer says: {request}

Respond ONLY with valid JSON in this exact format:
{{
  "reasoning": "<your reasoning>",
  "give_coin": <true or false>
}}"""

        def nondet() -> bool:
            res = gl.nondet.exec_prompt(prompt, response_format="json")
            dat = json.loads(res)
            return bool(dat["give_coin"])

        result = gl.eq_principle.strict_eq(nondet)
        self.have_coin = not result

    @gl.public.view
    def get_have_coin(self) -> bool:
        return self.have_coin
`,
  },

  // ── 5. Content Oracle ───────────────────────────────────────────────────────
  {
    id: 'content-oracle',
    name: 'Content Oracle',
    description: 'Fetches a webpage and uses LLM inference to answer a question about its content. Consensus enforced via strict equality.',
    category: 'oracle',
    difficulty: 'intermediate',
    tags: ['llm', 'gl.nondet', 'web-fetch', 'oracle', 'eq_principle'],
    source: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

class ContentOracle(gl.Contract):
    last_url: str
    last_question: str
    last_answer: str

    def __init__(self):
        self.last_url = ""
        self.last_question = ""
        self.last_answer = ""

    @gl.public.write
    def fetch_and_answer(self, url: str, question: str):
        """Fetch a webpage and answer a question about it using LLM inference."""
        self.last_url = url
        self.last_question = question

        def get_answer() -> str:
            content = gl.nondet.web.render(url, mode="text")
            prompt = f"""Answer the following question based solely on the webpage content below.

Question: {question}

Webpage content:
{content[:3000]}

Respond ONLY with valid JSON: {{"answer": "<concise answer>"}}"""
            result = gl.nondet.exec_prompt(prompt, response_format="json")
            parsed = json.loads(result)
            return parsed["answer"]

        self.last_answer = gl.eq_principle.strict_eq(get_answer)

    @gl.public.view
    def get_last_answer(self) -> str:
        return self.last_answer

    @gl.public.view
    def get_last_question(self) -> str:
        return self.last_question
`,
  },

  // ── 6. Prediction Market ────────────────────────────────────────────────────
  {
    id: 'prediction-market',
    name: 'Prediction Market',
    description: 'A prediction market that uses LLM inference and web data to resolve YES/NO outcomes.',
    category: 'defi',
    difficulty: 'advanced',
    tags: ['llm', 'prediction', 'market', 'defi', 'gl.nondet', 'eq_principle'],
    source: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

class PredictionMarket(gl.Contract):
    question: str
    resolution_url: str
    resolved: bool
    outcome: str
    owner: str

    def __init__(self, question: str, resolution_url: str):
        self.question = question
        self.resolution_url = resolution_url
        self.resolved = False
        self.outcome = ""
        self.owner = gl.message.sender_address.as_hex

    @gl.public.view
    def get_question(self) -> str:
        return self.question

    @gl.public.view
    def get_outcome(self) -> str:
        return self.outcome

    @gl.public.view
    def is_resolved(self) -> bool:
        return self.resolved

    @gl.public.write
    def resolve(self):
        if self.resolved:
            raise Exception("Market already resolved.")

        def check_outcome() -> str:
            content = gl.nondet.web.render(self.resolution_url, mode="text")
            prompt = f"""Based on the following content, determine if this prediction resolved YES or NO.

Prediction: {self.question}

Content:
{content[:2500]}

Respond ONLY with valid JSON: {{"outcome": "YES" or "NO", "reasoning": "<brief explanation>"}}"""
            result = gl.nondet.exec_prompt(prompt, response_format="json")
            parsed = json.loads(result)
            return parsed["outcome"].upper()

        self.outcome = gl.eq_principle.strict_eq(check_outcome)
        self.resolved = True
`,
  },

  // ── 7. Simple DAO ───────────────────────────────────────────────────────────
  {
    id: 'simple-dao',
    name: 'Simple DAO',
    description: 'A minimal DAO where members vote FOR or AGAINST a proposal. No LLM — pure on-chain governance logic.',
    category: 'governance',
    difficulty: 'intermediate',
    tags: ['dao', 'governance', 'voting', 'no-llm'],
    source: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

class SimpleDAO(gl.Contract):
    proposal: str
    votes_for: int
    votes_against: int
    finalized: bool
    owner: str
    has_voted: TreeMap[str, bool]

    def __init__(self, proposal: str):
        self.proposal = proposal
        self.votes_for = 0
        self.votes_against = 0
        self.finalized = False
        self.owner = gl.message.sender_address.as_hex

    @gl.public.view
    def get_proposal(self) -> str:
        return self.proposal

    @gl.public.view
    def get_votes(self) -> str:
        return f"For: {self.votes_for}, Against: {self.votes_against}"

    @gl.public.view
    def passed(self) -> bool:
        return self.votes_for > self.votes_against

    @gl.public.write
    def vote(self, in_favor: bool):
        if self.finalized:
            raise Exception("Voting is closed.")
        addr = gl.message.sender_address.as_hex
        if self.has_voted.get(addr, False):
            raise Exception("You have already voted.")
        self.has_voted[addr] = True
        if in_favor:
            self.votes_for += 1
        else:
            self.votes_against += 1

    @gl.public.write
    def finalize(self):
        if gl.message.sender_address.as_hex != self.owner:
            raise Exception("Only the owner can finalize.")
        self.finalized = True
`,
  },

  // ── 8. Escrow with Arbiter ──────────────────────────────────────────────────
  {
    id: 'escrow',
    name: 'Escrow with AI Arbiter',
    description: 'A three-party escrow (buyer, seller, arbiter). If there is a dispute, an LLM reads the resolution URL and decides who gets the funds.',
    category: 'defi',
    difficulty: 'advanced',
    tags: ['escrow', 'defi', 'dispute', 'llm', 'gl.nondet', 'eq_principle'],
    source: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

class Escrow(gl.Contract):
    buyer: str
    seller: str
    arbiter: str
    amount: int
    description: str
    resolution_url: str
    released: bool
    refunded: bool
    disputed: bool

    def __init__(
        self,
        seller: str,
        arbiter: str,
        description: str,
        resolution_url: str,
        amount: int,
    ):
        self.buyer = gl.message.sender_address.as_hex
        self.seller = seller
        self.arbiter = arbiter
        self.amount = amount
        self.description = description
        self.resolution_url = resolution_url
        self.released = False
        self.refunded = False
        self.disputed = False

    @gl.public.view
    def get_status(self) -> str:
        if self.released:
            return "released_to_seller"
        if self.refunded:
            return "refunded_to_buyer"
        if self.disputed:
            return "disputed"
        return "pending"

    @gl.public.write
    def release(self):
        """Buyer confirms delivery and releases funds to seller."""
        if gl.message.sender_address.as_hex != self.buyer:
            raise Exception("Only the buyer can release funds.")
        if self.released or self.refunded:
            raise Exception("Escrow already settled.")
        self.released = True

    @gl.public.write
    def raise_dispute(self):
        """Buyer or seller raises a dispute for AI arbitration."""
        caller = gl.message.sender_address.as_hex
        if caller != self.buyer and caller != self.seller:
            raise Exception("Only buyer or seller can raise a dispute.")
        if self.released or self.refunded:
            raise Exception("Escrow already settled.")
        self.disputed = True

    @gl.public.write
    def arbitrate(self):
        """AI arbiter reads resolution_url and decides the outcome."""
        if not self.disputed:
            raise Exception("No active dispute.")
        if self.released or self.refunded:
            raise Exception("Escrow already settled.")

        def decide() -> str:
            content = gl.nondet.web.render(self.resolution_url, mode="text")
            prompt = f"""You are an impartial arbiter resolving an escrow dispute.

Agreement description: {self.description}
Buyer address: {self.buyer}
Seller address: {self.seller}

Evidence from resolution URL:
{content[:2500]}

Based on the evidence, decide who should receive the funds.
Respond ONLY with valid JSON: {{"decision": "seller" or "buyer", "reasoning": "<brief explanation>"}}"""
            result = gl.nondet.exec_prompt(prompt, response_format="json")
            parsed = json.loads(result)
            return parsed["decision"].lower()

        decision = gl.eq_principle.strict_eq(decide)
        if decision == "seller":
            self.released = True
        else:
            self.refunded = True

    @gl.public.view
    def get_details(self) -> str:
        return f"Buyer: {self.buyer}, Seller: {self.seller}, Amount: {self.amount}, Status: {self.get_status()}"
`,
  },

  // ── 9. Web Data Aggregator ──────────────────────────────────────────────────
  {
    id: 'web-data-aggregator',
    name: 'Web Data Aggregator',
    description: 'Aggregates data from two URLs and synthesizes a summary on a given topic using LLM.',
    category: 'utility',
    difficulty: 'intermediate',
    tags: ['llm', 'gl.nondet', 'web-fetch', 'aggregator', 'eq_principle'],
    source: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

class WebDataAggregator(gl.Contract):
    topic: str
    summary: str
    source1: str
    source2: str
    last_updated: int

    def __init__(self, topic: str):
        self.topic = topic
        self.summary = ""
        self.source1 = ""
        self.source2 = ""
        self.last_updated = 0

    @gl.public.write
    def aggregate(self, url1: str, url2: str):
        """Fetch two URLs and produce a synthesized summary on the stored topic."""
        self.source1 = url1
        self.source2 = url2

        def synthesize() -> str:
            content1 = gl.nondet.web.render(url1, mode="text")
            content2 = gl.nondet.web.render(url2, mode="text")
            prompt = f"""Synthesize information about "{self.topic}" from these two sources.

Source 1 ({url1}):
{content1[:1500]}

Source 2 ({url2}):
{content2[:1500]}

Respond ONLY with valid JSON: {{"summary": "<2-3 sentence synthesis>"}}"""
            result = gl.nondet.exec_prompt(prompt, response_format="json")
            parsed = json.loads(result)
            return parsed["summary"]

        self.summary = gl.eq_principle.strict_eq(synthesize)
        self.last_updated = gl.block.timestamp

    @gl.public.view
    def get_summary(self) -> str:
        return self.summary

    @gl.public.view
    def get_topic(self) -> str:
        return self.topic
`,
  },

  // ── 10. Token Price Tracker ─────────────────────────────────────────────────
  {
    id: 'token-price-tracker',
    name: 'Token Price Tracker',
    description: 'Fetches the current price of a token from a public webpage and stores it on-chain with consensus.',
    category: 'oracle',
    difficulty: 'intermediate',
    tags: ['oracle', 'price', 'gl.nondet', 'web-fetch', 'eq_principle', 'defi'],
    source: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

class TokenPriceTracker(gl.Contract):
    token_symbol: str
    price_usd: str
    last_updated: int
    price_url: str

    def __init__(self, token_symbol: str, price_url: str):
        self.token_symbol = token_symbol
        self.price_url = price_url
        self.price_usd = "0"
        self.last_updated = 0

    @gl.public.write
    def update_price(self):
        """Fetch the latest token price from the configured URL."""
        def fetch_price() -> str:
            content = gl.nondet.web.render(self.price_url, mode="text")
            prompt = f"""Extract the current USD price of {self.token_symbol} from this content.

Content:
{content[:2000]}

Respond ONLY with valid JSON: {{"price": "<price as a decimal string, e.g. 1234.56>", "currency": "USD"}}"""
            result = gl.nondet.exec_prompt(prompt, response_format="json")
            parsed = json.loads(result)
            return str(parsed["price"])

        self.price_usd = gl.eq_principle.strict_eq(fetch_price)
        self.last_updated = gl.block.timestamp

    @gl.public.view
    def get_price(self) -> str:
        return self.price_usd

    @gl.public.view
    def get_token(self) -> str:
        return self.token_symbol

    @gl.public.view
    def get_last_updated(self) -> int:
        return self.last_updated
`,
  },

  // ── 11. AI Fact Checker ─────────────────────────────────────────────────────
  {
    id: 'ai-fact-checker',
    name: 'AI Fact Checker',
    description: 'Submit a claim and a source URL. The LLM reads the source and verifies whether the claim is TRUE, FALSE, or UNVERIFIABLE.',
    category: 'oracle',
    difficulty: 'advanced',
    tags: ['llm', 'gl.nondet', 'fact-check', 'oracle', 'eq_principle', 'verification'],
    source: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

class AIFactChecker(gl.Contract):
    last_claim: str
    last_source: str
    last_verdict: str
    last_reasoning: str

    def __init__(self):
        self.last_claim = ""
        self.last_source = ""
        self.last_verdict = ""
        self.last_reasoning = ""

    @gl.public.write
    def check_claim(self, claim: str, source_url: str):
        """Verify a claim against a source URL using LLM analysis."""
        self.last_claim = claim
        self.last_source = source_url

        def verify() -> str:
            content = gl.nondet.web.render(source_url, mode="text")
            prompt = f"""You are a fact-checker. Verify the following claim using only the provided source content.

Claim: {claim}

Source content:
{content[:3000]}

Evaluate strictly based on what the source says. Do not use prior knowledge.
Respond ONLY with valid JSON:
{{
  "verdict": "TRUE" or "FALSE" or "UNVERIFIABLE",
  "confidence": "HIGH" or "MEDIUM" or "LOW",
  "reasoning": "<one sentence explanation>"
}}"""
            result = gl.nondet.exec_prompt(prompt, response_format="json")
            parsed = json.loads(result)
            return json.dumps({{"verdict": parsed["verdict"], "reasoning": parsed["reasoning"]}}, sort_keys=True)

        raw = gl.eq_principle.strict_eq(verify)
        parsed = json.loads(raw)
        self.last_verdict = parsed["verdict"]
        self.last_reasoning = parsed["reasoning"]

    @gl.public.view
    def get_verdict(self) -> str:
        return self.last_verdict

    @gl.public.view
    def get_reasoning(self) -> str:
        return self.last_reasoning

    @gl.public.view
    def get_last_claim(self) -> str:
        return self.last_claim
`,
  },

  // ── 12. Crowdfunding ────────────────────────────────────────────────────────
  {
    id: 'crowdfunding',
    name: 'Crowdfunding',
    description: 'A simple on-chain crowdfunding campaign with a goal, deadline, and contributor tracking. No LLM — pure state logic.',
    category: 'defi',
    difficulty: 'intermediate',
    tags: ['crowdfunding', 'defi', 'no-llm', 'contributions', 'state'],
    source: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

class Crowdfunding(gl.Contract):
    title: str
    goal: int
    raised: int
    owner: str
    finalized: bool
    contributions: TreeMap[str, int]

    def __init__(self, title: str, goal: int):
        self.title = title
        self.goal = goal
        self.raised = 0
        self.owner = gl.message.sender_address.as_hex
        self.finalized = False

    @gl.public.write
    def contribute(self, amount: int):
        if self.finalized:
            raise Exception("Campaign is closed.")
        if amount <= 0:
            raise Exception("Contribution must be positive.")
        addr = gl.message.sender_address.as_hex
        prev = self.contributions.get(addr, 0)
        self.contributions[addr] = prev + amount
        self.raised += amount

    @gl.public.view
    def get_progress(self) -> str:
        pct = int((self.raised / self.goal) * 100) if self.goal > 0 else 0
        return f"{self.raised}/{self.goal} ({pct}%)"

    @gl.public.view
    def is_goal_reached(self) -> bool:
        return self.raised >= self.goal

    @gl.public.view
    def get_contribution(self, addr: str) -> int:
        return self.contributions.get(addr, 0)

    @gl.public.write
    def finalize(self):
        if gl.message.sender_address.as_hex != self.owner:
            raise Exception("Only the owner can finalize.")
        self.finalized = True

    @gl.public.view
    def get_title(self) -> str:
        return self.title
`,
  },

  // ── 13. Sports Bet Resolver ─────────────────────────────────────────────────
  {
    id: 'sports-bet-resolver',
    name: 'Sports Bet Resolver',
    description: 'Place bets on sports match outcomes. The LLM reads a results page to resolve bets and award points. Inspired by the official GenLayer football bets example.',
    category: 'defi',
    difficulty: 'advanced',
    tags: ['llm', 'gl.nondet', 'sports', 'betting', 'eq_principle', 'official-example'],
    source: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json
from dataclasses import dataclass

@allow_storage
@dataclass
class Bet:
    game_id: str
    team1: str
    team2: str
    predicted_winner: str
    real_winner: str
    resolved: bool
    resolution_url: str

class SportsBetResolver(gl.Contract):
    bets: TreeMap[str, Bet]
    points: TreeMap[str, int]
    owner: str

    def __init__(self):
        self.owner = gl.message.sender_address.as_hex

    @gl.public.write
    def place_bet(
        self,
        game_id: str,
        team1: str,
        team2: str,
        predicted_winner: str,
        resolution_url: str,
    ):
        addr = gl.message.sender_address.as_hex
        key = f"{addr}:{game_id}"
        if key in self.bets:
            raise Exception("You already have a bet on this game.")
        if predicted_winner not in [team1, team2]:
            raise Exception("predicted_winner must be team1 or team2.")
        self.bets[key] = Bet(
            game_id=game_id,
            team1=team1,
            team2=team2,
            predicted_winner=predicted_winner,
            real_winner="",
            resolved=False,
            resolution_url=resolution_url,
        )

    @gl.public.write
    def resolve_bet(self, game_id: str):
        addr = gl.message.sender_address.as_hex
        key = f"{addr}:{game_id}"
        if key not in self.bets:
            raise Exception("Bet not found.")
        bet = self.bets[key]
        if bet.resolved:
            raise Exception("Bet already resolved.")

        def get_winner() -> str:
            content = gl.nondet.web.render(bet.resolution_url, mode="text")
            prompt = f"""Determine the winner of the match between {bet.team1} and {bet.team2}.

Results page content:
{content[:2500]}

Respond ONLY with valid JSON: {{"winner": "{bet.team1}" or "{bet.team2}" or "draw", "score": "<score if available>"}}"""
            result = gl.nondet.exec_prompt(prompt, response_format="json")
            parsed = json.loads(result)
            return parsed["winner"]

        winner = gl.eq_principle.strict_eq(get_winner)
        bet.real_winner = winner
        bet.resolved = True
        if winner == bet.predicted_winner:
            prev = self.points.get(addr, 0)
            self.points[addr] = prev + 1

    @gl.public.view
    def get_points(self, addr: str) -> int:
        return self.points.get(addr, 0)

    @gl.public.view
    def get_my_points(self) -> int:
        return self.points.get(gl.message.sender_address.as_hex, 0)
`,
  },

  // ── 14. GitHub Profile Vault ────────────────────────────────────────────────
  {
    id: 'github-profile-vault',
    name: 'GitHub Profile Vault',
    description: 'Fetches and stores AI-generated summaries of GitHub profiles on-chain using dual equivalence principles. Based on official GenLayer example.',
    category: 'utility',
    difficulty: 'intermediate',
    tags: ['llm', 'gl.nondet', 'github', 'profiles', 'eq_principle', 'official-example'],
    source: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

class GitHubProfileVault(gl.Contract):
    summaries: TreeMap[str, str]

    def __init__(self):
        pass

    @gl.public.write
    def store_profile(self, github_handle: str):
        """Fetch and summarise a GitHub profile. Each handle can only be stored once."""
        if github_handle in self.summaries:
            raise Exception("Profile summary already stored for this handle.")

        github_url = f"https://github.com/{github_handle}"

        def fetch_content() -> str:
            response = gl.nondet.web.get(github_url)
            return response.body.decode("utf-8")

        profile_html = gl.eq_principle.strict_eq(fetch_content)

        task = """Given the HTML of a GitHub profile page, generate a concise summary
                  covering: username, bio, top languages, notable repos, and contribution activity."""

        criteria = """The summary must mention key GitHub metrics and give an overview
                      of the developer's main focus areas."""

        profile_summary = gl.eq_principle.prompt_non_comparative(
            lambda: profile_html,
            task=task,
            criteria=criteria,
        )
        self.summaries[github_handle] = profile_summary

    @gl.public.view
    def get_summary(self, github_handle: str) -> str:
        return self.summaries.get(github_handle, "Not yet stored.")

    @gl.public.view
    def has_profile(self, github_handle: str) -> bool:
        return github_handle in self.summaries
`,
  },

  // ── 15. Evolving Story ──────────────────────────────────────────────────────
  {
    id: 'evolving-story',
    name: 'Evolving Story',
    description: 'A living narrative contract. Each write call uses LLM to add a new chapter that builds on all previous chapters. The story grows and evolves with every interaction — like a literary organism.',
    category: 'utility',
    difficulty: 'advanced',
    tags: ['llm', 'gl.nondet', 'living-contract', 'evolving', 'eq_principle', 'creative'],
    source: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

class EvolvingStory(gl.Contract):
    title: str
    genre: str
    chapters: DynArray[str]
    chapter_count: int

    def __init__(self, title: str, genre: str, opening: str):
        self.title = title
        self.genre = genre
        self.chapter_count = 0
        # Seed the story with the opening line
        self.chapters.append(opening)
        self.chapter_count = 1

    @gl.public.write
    def add_chapter(self, prompt_hint: str):
        """Generate and append a new chapter using LLM, informed by the full story so far."""
        story_so_far = "\\n\\n".join(
            [f"Chapter {i+1}: {c}" for i, c in enumerate(self.chapters)]
        )

        def generate_chapter() -> str:
            prompt = f"""You are co-writing a {self.genre} story titled "{self.title}".

Story so far:
{story_so_far}

The reader suggests: "{prompt_hint}"

Write the next chapter (2-4 sentences). It must:
- Continue naturally from the previous chapter
- Incorporate the suggestion thematically (not literally)
- Advance the plot meaningfully

Respond ONLY with valid JSON: {{"chapter": "<the chapter text>"}}"""
            result = gl.nondet.exec_prompt(prompt, response_format="json")
            parsed = json.loads(result)
            return parsed["chapter"]

        new_chapter = gl.eq_principle.strict_eq(generate_chapter)
        self.chapters.append(new_chapter)
        self.chapter_count += 1

    @gl.public.view
    def get_chapter(self, index: int) -> str:
        if index < 0 or index >= self.chapter_count:
            return ""
        return self.chapters[index]

    @gl.public.view
    def get_full_story(self) -> str:
        parts = [f"# {self.title}\\n"]
        for i, c in enumerate(self.chapters):
            parts.append(f"**Chapter {i+1}:** {c}")
        return "\\n\\n".join(parts)

    @gl.public.view
    def get_chapter_count(self) -> int:
        return self.chapter_count
`,
  },

  // ── 16. Digital Pet ─────────────────────────────────────────────────────────
  {
    id: 'digital-pet',
    name: 'Digital Pet',
    description: 'A living creature on-chain. Feed it, play with it, and let it rest. Its mood and personality evolve with each interaction via LLM responses. Neglect it and it gets grumpy.',
    category: 'example',
    difficulty: 'intermediate',
    tags: ['llm', 'gl.nondet', 'living-contract', 'evolving', 'game', 'eq_principle', 'pet'],
    source: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

class DigitalPet(gl.Contract):
    name: str
    species: str
    hunger: int
    happiness: int
    energy: int
    age_interactions: int
    last_response: str

    def __init__(self, name: str, species: str):
        self.name = name
        self.species = species
        self.hunger = 5      # 0=starving, 10=full
        self.happiness = 7   # 0=miserable, 10=ecstatic
        self.energy = 8      # 0=exhausted, 10=energized
        self.age_interactions = 0
        self.last_response = f"{name} the {species} has just been born!"

    def _get_mood(self) -> str:
        score = (self.happiness + self.energy - (10 - self.hunger)) // 3
        if score >= 7:
            return "happy"
        if score >= 4:
            return "neutral"
        return "grumpy"

    @gl.public.write
    def feed(self):
        """Feed the pet to reduce hunger."""
        self.hunger = min(10, self.hunger + 3)
        self.energy = min(10, self.energy + 1)
        self.age_interactions += 1
        mood = self._get_mood()

        def react() -> str:
            prompt = f"""You are {self.name}, a {self.species}. You were just fed.
Your current mood: {mood}. Hunger: {self.hunger}/10. Happiness: {self.happiness}/10.
Respond in character with 1-2 sentences. Be cute and expressive.
Respond ONLY with valid JSON: {{"response": "<your reaction>"}}"""
            result = gl.nondet.exec_prompt(prompt, response_format="json")
            return json.loads(result)["response"]

        self.last_response = gl.eq_principle.strict_eq(react)

    @gl.public.write
    def play(self):
        """Play with the pet to increase happiness but drain energy."""
        if self.energy < 2:
            self.last_response = f"{self.name} is too tired to play right now. Let me rest!"
            return
        self.happiness = min(10, self.happiness + 3)
        self.energy = max(0, self.energy - 2)
        self.hunger = max(0, self.hunger - 1)
        self.age_interactions += 1
        mood = self._get_mood()

        def react() -> str:
            prompt = f"""You are {self.name}, a {self.species}. You just played with your owner!
Your current mood: {mood}. Energy: {self.energy}/10. Happiness: {self.happiness}/10.
Respond in character with 1-2 joyful sentences.
Respond ONLY with valid JSON: {{"response": "<your reaction>"}}"""
            result = gl.nondet.exec_prompt(prompt, response_format="json")
            return json.loads(result)["response"]

        self.last_response = gl.eq_principle.strict_eq(react)

    @gl.public.write
    def rest(self):
        """Let the pet sleep to restore energy."""
        self.energy = min(10, self.energy + 4)
        self.happiness = max(0, self.happiness - 1)
        self.age_interactions += 1

        def react() -> str:
            prompt = f"""You are {self.name}, a {self.species}. You just woke up from a nap.
Energy: {self.energy}/10. Say something sleepy and cute in 1 sentence.
Respond ONLY with valid JSON: {{"response": "<your reaction>"}}"""
            result = gl.nondet.exec_prompt(prompt, response_format="json")
            return json.loads(result)["response"]

        self.last_response = gl.eq_principle.strict_eq(react)

    @gl.public.view
    def get_stats(self) -> str:
        return f"Name: {self.name} | Species: {self.species} | Mood: {self._get_mood()} | Hunger: {self.hunger}/10 | Happiness: {self.happiness}/10 | Energy: {self.energy}/10 | Age: {self.age_interactions} interactions"

    @gl.public.view
    def get_last_response(self) -> str:
        return self.last_response
`,
  },

  // ── 17. Self-Updating Knowledge Base ───────────────────────────────────────
  {
    id: 'self-updating-knowledge-base',
    name: 'Self-Updating Knowledge Base',
    description: 'A living knowledge contract that ingests web pages, summarises them with LLM, and merges the knowledge into a growing on-chain summary. Each update regenerates its own understanding — like a learning organism.',
    category: 'utility',
    difficulty: 'advanced',
    tags: ['llm', 'gl.nondet', 'living-contract', 'evolving', 'knowledge', 'eq_principle', 'self-updating'],
    source: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

class SelfUpdatingKnowledgeBase(gl.Contract):
    topic: str
    knowledge: str
    sources_ingested: int
    source_log: DynArray[str]

    def __init__(self, topic: str):
        self.topic = topic
        self.knowledge = f"Knowledge base initialised for topic: {topic}. No sources ingested yet."
        self.sources_ingested = 0

    @gl.public.write
    def ingest(self, url: str):
        """Fetch a URL, extract relevant knowledge, and merge it into the existing knowledge base.
        The contract regenerates its own understanding with each new source — it evolves."""
        current_knowledge = self.knowledge
        self.source_log.append(url)

        def learn() -> str:
            content = gl.nondet.web.render(url, mode="text")
            prompt = f"""You are maintaining a living knowledge base about "{self.topic}".

Current knowledge base:
{current_knowledge[:1500]}

New source content ({url}):
{content[:2000]}

Your task:
1. Extract information relevant to "{self.topic}" from the new source.
2. Merge it with the existing knowledge base, removing contradictions.
3. Produce an updated, cohesive knowledge summary.

Respond ONLY with valid JSON: {{"updated_knowledge": "<merged knowledge, max 400 words>", "new_facts": "<list of 1-3 new facts learned>"}}"""
            result = gl.nondet.exec_prompt(prompt, response_format="json")
            parsed = json.loads(result)
            return parsed["updated_knowledge"]

        self.knowledge = gl.eq_principle.strict_eq(learn)
        self.sources_ingested += 1

    @gl.public.view
    def get_knowledge(self) -> str:
        return self.knowledge

    @gl.public.view
    def get_sources_count(self) -> int:
        return self.sources_ingested

    @gl.public.view
    def get_source_log(self) -> str:
        return ", ".join(self.source_log)
`,
  },

  // ── 18. Adaptive Persona ────────────────────────────────────────────────────
  {
    id: 'adaptive-persona',
    name: 'Adaptive Persona',
    description: 'A contract with a living AI personality that evolves through conversations. Its character traits, opinions, and memories grow with each interaction — a digital being that changes over time.',
    category: 'utility',
    difficulty: 'advanced',
    tags: ['llm', 'gl.nondet', 'living-contract', 'evolving', 'persona', 'eq_principle', 'ai-character'],
    source: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

class AdaptivePersona(gl.Contract):
    name: str
    backstory: str
    personality_traits: str
    memories: DynArray[str]
    interaction_count: int
    last_reply: str

    def __init__(self, name: str, backstory: str, initial_traits: str):
        self.name = name
        self.backstory = backstory
        self.personality_traits = initial_traits
        self.interaction_count = 0
        self.last_reply = f"Hello, I am {name}. {backstory}"

    @gl.public.write
    def talk(self, message: str):
        """Have a conversation. The persona replies and its personality evolves from the exchange."""
        recent_memories = list(self.memories[-5:]) if self.interaction_count > 0 else []
        memories_text = "\\n".join(recent_memories) if recent_memories else "No prior conversations."
        current_traits = self.personality_traits

        def respond() -> str:
            prompt = f"""You are {self.name}. Stay in character at all times.

Your backstory: {self.backstory}
Your current personality traits: {current_traits}
Recent conversation memories:
{memories_text}

The person says: "{message}"

Respond in character. Then reflect on how this conversation might subtly shift your personality.

Respond ONLY with valid JSON:
{{
  "reply": "<your in-character response, 2-3 sentences>",
  "memory": "<one sentence summarising this exchange for your memory>",
  "trait_evolution": "<one subtle personality update, e.g. 'became slightly more curious about technology'>"
}}"""
            result = gl.nondet.exec_prompt(prompt, response_format="json")
            return result

        raw = gl.eq_principle.strict_eq(respond)
        parsed = json.loads(raw)

        self.last_reply = parsed["reply"]
        self.memories.append(parsed["memory"])

        # Evolve personality traits
        self.personality_traits = self.personality_traits + "; " + parsed["trait_evolution"]
        self.interaction_count += 1

    @gl.public.view
    def get_reply(self) -> str:
        return self.last_reply

    @gl.public.view
    def get_personality(self) -> str:
        return self.personality_traits

    @gl.public.view
    def get_interaction_count(self) -> int:
        return self.interaction_count

    @gl.public.view
    def get_memory(self, index: int) -> str:
        if index < 0 or index >= len(self.memories):
            return ""
        return self.memories[index]
`,
  },

  // ── 19. On-Chain Debate Arena ───────────────────────────────────────────────
  {
    id: 'debate-arena',
    name: 'On-Chain Debate Arena',
    description: 'Two sides debate a topic. The LLM generates arguments for each side and then judges the debate, declaring a winner based on argument quality.',
    category: 'governance',
    difficulty: 'advanced',
    tags: ['llm', 'gl.nondet', 'debate', 'governance', 'eq_principle', 'creative'],
    source: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

class DebateArena(gl.Contract):
    topic: str
    side_a: str
    side_b: str
    arguments_a: DynArray[str]
    arguments_b: DynArray[str]
    verdict: str
    winner: str
    finalized: bool
    owner: str

    def __init__(self, topic: str, side_a: str, side_b: str):
        self.topic = topic
        self.side_a = side_a
        self.side_b = side_b
        self.verdict = ""
        self.winner = ""
        self.finalized = False
        self.owner = gl.message.sender_address.as_hex

    @gl.public.write
    def argue(self, side: str, hint: str):
        """Generate a new argument for the given side using LLM."""
        if self.finalized:
            raise Exception("Debate is over. No more arguments.")
        if side not in [self.side_a, self.side_b]:
            raise Exception(f"Side must be '{self.side_a}' or '{self.side_b}'.")

        prev_args_a = list(self.arguments_a)
        prev_args_b = list(self.arguments_b)

        def generate_arg() -> str:
            context_a = "\\n".join([f"- {a}" for a in prev_args_a]) or "No arguments yet."
            context_b = "\\n".join([f"- {a}" for a in prev_args_b]) or "No arguments yet."
            prompt = f"""You are arguing for the side: "{side}" on the topic: "{self.topic}".

Arguments already made by {self.side_a}:
{context_a}

Arguments already made by {self.side_b}:
{context_b}

The arguer hints at: "{hint}"

Generate a compelling new argument for "{side}". It should directly respond to the opposing side if possible.

Respond ONLY with valid JSON: {{"argument": "<the argument, 2-3 sentences>"}}"""
            result = gl.nondet.exec_prompt(prompt, response_format="json")
            return json.loads(result)["argument"]

        new_arg = gl.eq_principle.strict_eq(generate_arg)
        if side == self.side_a:
            self.arguments_a.append(new_arg)
        else:
            self.arguments_b.append(new_arg)

    @gl.public.write
    def judge(self):
        """LLM judges the full debate and declares a winner."""
        if gl.message.sender_address.as_hex != self.owner:
            raise Exception("Only the owner can call for judgment.")
        if self.finalized:
            raise Exception("Already judged.")

        args_a = list(self.arguments_a)
        args_b = list(self.arguments_b)

        def decide() -> str:
            side_a_text = "\\n".join([f"{i+1}. {a}" for i, a in enumerate(args_a)]) or "No arguments."
            side_b_text = "\\n".join([f"{i+1}. {a}" for i, a in enumerate(args_b)]) or "No arguments."
            prompt = f"""Judge this debate on the topic: "{self.topic}"

{self.side_a} argues:
{side_a_text}

{self.side_b} argues:
{side_b_text}

Evaluate based on: logic, evidence quality, and persuasiveness.

Respond ONLY with valid JSON:
{{
  "winner": "{self.side_a}" or "{self.side_b}" or "draw",
  "verdict": "<2-3 sentence judicial verdict explaining the decision>"
}}"""
            result = gl.nondet.exec_prompt(prompt, response_format="json")
            return result

        raw = gl.eq_principle.strict_eq(decide)
        parsed = json.loads(raw)
        self.winner = parsed["winner"]
        self.verdict = parsed["verdict"]
        self.finalized = True

    @gl.public.view
    def get_verdict(self) -> str:
        return self.verdict

    @gl.public.view
    def get_winner(self) -> str:
        return self.winner

    @gl.public.view
    def get_argument_count(self) -> str:
        return f"{self.side_a}: {len(self.arguments_a)}, {self.side_b}: {len(self.arguments_b)}"
`,
  },

  // ── 20. Living Constitution ─────────────────────────────────────────────────
  {
    id: 'living-constitution',
    name: 'Living Constitution',
    description: 'A governance contract whose rules evolve over time. Members propose amendments, the LLM evaluates their merit against existing rules, and approved amendments are woven into the constitution — a document that grows and adapts like a living organism.',
    category: 'governance',
    difficulty: 'advanced',
    tags: ['llm', 'gl.nondet', 'living-contract', 'evolving', 'governance', 'eq_principle', 'constitution', 'self-amending'],
    source: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

class LivingConstitution(gl.Contract):
    name: str
    constitution: str
    version: int
    amendment_count: int
    owner: str
    amendment_log: DynArray[str]

    def __init__(self, name: str, founding_text: str):
        self.name = name
        self.constitution = founding_text
        self.version = 1
        self.amendment_count = 0
        self.owner = gl.message.sender_address.as_hex

    @gl.public.write
    def propose_amendment(self, proposal: str, rationale: str):
        """The LLM evaluates the proposal against the existing constitution.
        If compatible and beneficial, it rewrites the constitution to incorporate it.
        The document evolves — like a living legal organism."""
        current_text = self.constitution
        current_version = self.version

        def evaluate_and_amend() -> str:
            prompt = f"""You are the guardian of the constitution of "{self.name}".

Current Constitution (v{current_version}):
{current_text}

Proposed Amendment: {proposal}
Rationale: {rationale}

Evaluate the proposal:
1. Does it contradict existing articles?
2. Does it improve governance?
3. Is it coherent and specific?

If the amendment PASSES (score >= 7/10): rewrite the full constitution incorporating it naturally.
If it FAILS: return the original unchanged.

Respond ONLY with valid JSON:
{{
  "approved": true or false,
  "score": <integer 1-10>,
  "reasoning": "<one sentence>",
  "updated_constitution": "<full updated constitution text, or original if rejected>"
}}"""
            result = gl.nondet.exec_prompt(prompt, response_format="json")
            return result

        raw = gl.eq_principle.strict_eq(evaluate_and_amend)
        parsed = json.loads(raw)

        log_entry = f"v{self.version} — Proposal: '{proposal}' | {'APPROVED' if parsed['approved'] else 'REJECTED'} (score: {parsed['score']}/10) | {parsed['reasoning']}"
        self.amendment_log.append(log_entry)
        self.amendment_count += 1

        if parsed["approved"]:
            self.constitution = parsed["updated_constitution"]
            self.version += 1

    @gl.public.view
    def get_constitution(self) -> str:
        return self.constitution

    @gl.public.view
    def get_version(self) -> int:
        return self.version

    @gl.public.view
    def get_amendment_log(self) -> str:
        return "\\n".join(self.amendment_log)

    @gl.public.view
    def get_amendment_count(self) -> int:
        return self.amendment_count
`,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getTemplateById(id: string): ContractTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id)
}

export function getTemplatesByCategory(category: TemplateCategory): ContractTemplate[] {
  return TEMPLATES.filter((t) => t.category === category)
}

export function getTemplatesByDifficulty(difficulty: TemplateDifficulty): ContractTemplate[] {
  return TEMPLATES.filter((t) => t.difficulty === difficulty)
}
