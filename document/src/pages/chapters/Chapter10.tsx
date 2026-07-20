import {BlockMath, InlineMath} from "../../components/math/Tex";
import CSpaceObstacle2R from "../../components/pages/chapter10/CSpaceObstacle2R";
import GridAStar from "../../components/pages/chapter10/GridAStar";
import PathSmoothing from "../../components/pages/chapter10/PathSmoothing";
import PotentialField from "../../components/pages/chapter10/PotentialField";
import SamplingPlanners from "../../components/pages/chapter10/SamplingPlanners";
import WavefrontPlanner from "../../components/pages/chapter10/WavefrontPlanner";
import {T} from "../../libs/i18n";

const Chapter10 = () => {
    return (
        <>
            <T en={<h2>Overview of Motion Planning</h2>} ko={<h2>Motion Planning 개관</h2>}/>
            <T
                en={<p>
                    <strong>Motion planning</strong> asks for a robot motion from a start to a goal that avoids
                    obstacles and respects constraints such as joint or torque limits. The setting is the{" "}
                    <strong>C-space</strong> from Chapter 2: a configuration is a point{" "}
                    <InlineMath math='q'/>, the collision-free part is{" "}
                    <InlineMath math='\mathcal{C}_{\mathrm{free}}'/>, and if dynamics matter the{" "}
                    <strong>state</strong> is <InlineMath math='x = (q, v)'/>. The robot's controls{" "}
                    <InlineMath math='u \in \mathcal{U}'/> drive the equations of motion:
                </p>}
                ko={<p>
                    <strong>Motion planning</strong>은 장애물을 피하고 관절·토크 한계 같은 제약을 지키면서 시작에서
                    목표로 가는 로봇 운동을 찾는 문제다. 무대는 2장의 <strong>C-space</strong>다. Configuration은 점{" "}
                    <InlineMath math='q'/>이고, 충돌 없는 부분이{" "}
                    <InlineMath math='\mathcal{C}_{\mathrm{free}}'/>이며, dynamics가 중요하면{" "}
                    <strong>상태</strong>는 <InlineMath math='x = (q, v)'/>다. 로봇의 제어 입력{" "}
                    <InlineMath math='u \in \mathcal{U}'/>가 운동 방정식을 몬다:
                </p>}
            />
            <BlockMath math={`\\dot x = f(x, u), \\qquad x(T) = x(0) + \\int_0^T f(x(t), u(t))\\,dt`}/>
            <T
                en={<p>
                    The general problem: find a time <InlineMath math='T'/> and controls{" "}
                    <InlineMath math='u : [0, T] \to \mathcal{U}'/> so that <InlineMath math='x(T) = x_{\mathrm{goal}}'/>{" "}
                    and <InlineMath math='q(x(t)) \in \mathcal{C}_{\mathrm{free}}'/> for all <InlineMath math='t'/>.
                    Several axes distinguish the variants:
                </p>}
                ko={<p>
                    일반 문제는 이렇다. 시간 <InlineMath math='T'/>와 제어{" "}
                    <InlineMath math='u : [0, T] \to \mathcal{U}'/>를 찾아{" "}
                    <InlineMath math='x(T) = x_{\mathrm{goal}}'/>이고 모든 <InlineMath math='t'/>에서{" "}
                    <InlineMath math='q(x(t)) \in \mathcal{C}_{\mathrm{free}}'/>가 되게 하라. 변형들을 가르는 축이
                    몇 개 있다:
                </p>}
            />
            <T
                en={<ul className="list-disc pl-6 space-y-1">
                    <li><strong>Path planning vs. motion planning</strong>: path planning is the purely geometric
                        subproblem (find <InlineMath math='q(s)'/>, then time scale it with Chapter 9); motion
                        planning may involve dynamics, time, and control constraints.</li>
                    <li><strong><InlineMath math='m = n'/> vs. <InlineMath math='m < n'/></strong>: with fewer
                        controls than degrees of freedom (a car: <InlineMath math='n = 3'/>,{" "}
                        <InlineMath math='m = 2'/>), many collision-free paths are simply not followable, like sliding
                        sideways into a parking spot.</li>
                    <li><strong>Online vs. offline</strong>, <strong>optimal vs. satisficing</strong> (minimize a cost{" "}
                        <InlineMath math='J = \int_0^T L(x, u)\,dt'/>, or just reach the goal), <strong>exact vs.
                        approximate</strong>, with or without obstacles.</li>
                </ul>}
                ko={<ul className="list-disc pl-6 space-y-1">
                    <li><strong>Path planning vs. motion planning</strong>: path planning은 순수 기하 부분 문제다
                        (<InlineMath math='q(s)'/>를 찾고 9장의 time scaling을 입힌다). Motion planning은 dynamics,
                        시간, 제어 제약까지 다룰 수 있다.</li>
                    <li><strong><InlineMath math='m = n'/> vs. <InlineMath math='m < n'/></strong>: 자유도보다 제어가
                        적으면 (자동차: <InlineMath math='n = 3'/>, <InlineMath math='m = 2'/>) 충돌이 없어도 따라갈
                        수 없는 경로가 많다. 옆으로 미끄러져 주차하는 경로처럼.</li>
                    <li><strong>Online vs. offline</strong>, <strong>최적 vs. satisficing</strong> (비용{" "}
                        <InlineMath math='J = \int_0^T L(x, u)\,dt'/>를 최소화할지, 그냥 도달만 할지),{" "}
                        <strong>정확 vs. 근사</strong>, 장애물 유무.</li>
                </ul>}
            />
            <T
                en={<p>
                    Planners themselves are judged by <strong>completeness</strong>: a <em>complete</em> planner
                    always finds a solution when one exists (or reports failure); a{" "}
                    <em>resolution-complete</em> planner does so at the resolution of its discretization; a{" "}
                    <em>probabilistically complete</em> planner finds one with probability approaching 1 as running
                    time grows. Add multiple-query vs. single-query, anytime behavior, and computational complexity
                    (often exponential in the C-space dimension <InlineMath math='n'/>), and you have the map of this
                    chapter: complete methods are elegant but impractical, <strong>grid methods</strong> are
                    resolution-complete but exponential in <InlineMath math='n'/>, <strong>sampling methods</strong>{" "}
                    (RRT, PRM) scale to high dimensions but only satisfice, <strong>potential fields</strong> are fast
                    enough for reactive control but suffer local minima, and <strong>nonlinear optimization</strong>{" "}
                    polishes solutions but needs a good initial guess.
                </p>}
                ko={<p>
                    플래너 자체는 <strong>완전성</strong>으로 평가한다. <em>complete</em> 플래너는 해가 있으면 반드시
                    찾고 없으면 실패를 보고한다. <em>resolution-complete</em>는 이산화 해상도 안에서 그렇게 하고,{" "}
                    <em>probabilistically complete</em>는 시간이 갈수록 찾을 확률이 1로 간다. 여기에 multiple-query
                    vs. single-query, anytime 여부, 계산 복잡도(대개 C-space 차원 <InlineMath math='n'/>에
                    지수적)를 더하면 이 챕터의 지도가 그려진다. Complete 방법은 우아하지만 비실용적이고,{" "}
                    <strong>grid 방법</strong>은 resolution-complete지만 <InlineMath math='n'/>에 지수적이며,{" "}
                    <strong>sampling 방법</strong>(RRT, PRM)은 고차원으로 확장되지만 satisficing에 그치고,{" "}
                    <strong>potential field</strong>는 반응형 제어가 가능할 만큼 빠르지만 local minimum을 앓고,{" "}
                    <strong>비선형 최적화</strong>는 해를 다듬지만 좋은 초기 추정이 필요하다.
                </p>}
            />

            <T en={<h2>Configuration Space Obstacles</h2>} ko={<h2>C-space 장애물</h2>}/>
            <T
                en={<p>
                    Workspace obstacles partition the C-space into{" "}
                    <InlineMath math='\mathcal{C} = \mathcal{C}_{\mathrm{free}} \cup \mathcal{C}_{\mathrm{obs}}'/>,
                    and path planning becomes: move a <em>point</em> (the configuration) through{" "}
                    <InlineMath math='\mathcal{C}_{\mathrm{free}}'/>. The catch is that C-obstacles look nothing like
                    the workspace obstacles that generate them. For the 2R arm below, three round obstacles become
                    twisted bands on the <InlineMath math='(\theta_1, \theta_2)'/> torus, and they slice{" "}
                    <InlineMath math='\mathcal{C}_{\mathrm{free}}'/> into disconnected islands: if the start and goal
                    lie on different islands, no collision-free path exists at all.
                </p>}
                ko={<p>
                    작업 공간의 장애물은 C-space를{" "}
                    <InlineMath math='\mathcal{C} = \mathcal{C}_{\mathrm{free}} \cup \mathcal{C}_{\mathrm{obs}}'/>로
                    가르고, path planning은 "<em>점</em>(configuration) 하나를{" "}
                    <InlineMath math='\mathcal{C}_{\mathrm{free}}'/> 안에서 옮기기"가 된다. 함정은 C-obstacle의
                    생김새가 그것을 만든 작업 공간 장애물과 전혀 닮지 않았다는 것이다. 아래 2R 팔에서는 둥근 장애물
                    셋이 <InlineMath math='(\theta_1, \theta_2)'/> 토러스 위의 뒤틀린 띠가 되고, 이 띠들이{" "}
                    <InlineMath math='\mathcal{C}_{\mathrm{free}}'/>를 끊어진 섬들로 자른다. 시작과 목표가 다른 섬에
                    있으면 충돌 없는 경로 자체가 없다.
                </p>}
            />
            <CSpaceObstacle2R/>
            <T
                en={<p>
                    A few standard constructions build intuition. A <strong>circular mobile robot</strong> shrinks to
                    a point if every obstacle is <strong>grown</strong> by the robot's radius. A translating{" "}
                    <strong>polygonal robot</strong> yields a polygonal C-obstacle traced by sliding the robot around
                    the obstacle boundary. Let the same robot also <strong>rotate</strong> and the C-space becomes{" "}
                    <InlineMath math='(x, y, \theta)'/>: the C-obstacle is a three-dimensional stack of polygon
                    slices, one per angle. Exact representations get complicated this fast, which is why planners
                    lean on <strong>collision detection</strong> instead: conservative sphere covers of robot and
                    obstacle give the distance in one line,
                </p>}
                ko={<p>
                    표준 구성 몇 가지가 직관을 준다. <strong>원형 모바일 로봇</strong>은 모든 장애물을 로봇
                    반지름만큼 <strong>부풀리면</strong> 점이 된다. 평행이동만 하는 <strong>다각형 로봇</strong>은
                    로봇을 장애물 경계에 붙여 미끄러뜨리며 기준점을 따라 그리면 다각형 C-obstacle이 나온다. 같은
                    로봇이 <strong>회전</strong>까지 하면 C-space는 <InlineMath math='(x, y, \theta)'/>가 되고,
                    C-obstacle은 각도마다 하나씩 쌓인 3차원 조각 더미다. 정확한 표현은 이렇게 금방 복잡해지기 때문에
                    플래너는 대신 <strong>충돌 검사</strong>에 기댄다. 로봇과 장애물을 보수적인 구 덮개로 감싸면
                    거리가 한 줄로 나온다,
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`d(q, \\mathcal{B}) = \\min_{i,j}\\; \\lVert r_i(q) - b_j \\rVert - R_i - B_j`}/>
            </div>
            <T
                en={<p>
                    where <InlineMath math='r_i(q), R_i'/> are the robot's sphere centers and radii and{" "}
                    <InlineMath math='b_j, B_j'/> the obstacle's. Positive means clear, zero contact, negative
                    penetration. Conservative covers guarantee that "reported free" implies "actually free". Checking
                    a motion segment, not just a configuration, is done by sampling the segment finely and growing
                    the robot enough to cover the gaps between samples.
                </p>}
                ko={<p>
                    여기서 <InlineMath math='r_i(q), R_i'/>는 로봇 쪽 구의 중심과 반지름,{" "}
                    <InlineMath math='b_j, B_j'/>는 장애물 쪽이다. 양수면 여유, 0이면 접촉, 음수면 관통이다. 보수적
                    덮개는 "자유라고 보고되면 실제로도 자유"를 보장한다. Configuration 하나가 아니라 운동 구간을
                    검사할 때는, 구간을 잘게 샘플하고 샘플 사이 틈을 덮을 만큼 로봇을 부풀려 검사한다.
                </p>}
            />

            <T en={<h2>Graph Search: A*</h2>} ko={<h2>그래프 탐색: A*</h2>}/>
            <T
                en={<p>
                    Most planners eventually represent <InlineMath math='\mathcal{C}_{\mathrm{free}}'/> as a{" "}
                    <strong>graph</strong>: nodes are configurations, edges are feasible motions (weighted by cost),
                    and a motion plan is a path in the graph. <strong>A*</strong> finds a minimum-cost path
                    efficiently. It keeps a sorted list OPEN of frontier nodes, a list CLOSED of finished nodes, the
                    best known cost-so-far <InlineMath math='\texttt{past\_cost}'/>, and parent links. The loop:
                </p>}
                ko={<p>
                    대부분의 플래너는 결국 <InlineMath math='\mathcal{C}_{\mathrm{free}}'/>를{" "}
                    <strong>그래프</strong>로 나타낸다. 노드는 configuration, 간선은 실현 가능한 운동(비용 가중)이고,
                    motion plan은 그래프 위의 경로다. <strong>A*</strong>는 최소 비용 경로를 효율적으로 찾는다.
                    frontier 노드의 정렬 리스트 OPEN, 끝난 노드 리스트 CLOSED, 지금까지의 최선 비용{" "}
                    <InlineMath math='\texttt{past\_cost}'/>, parent 링크를 유지하며 다음 루프를 돈다:
                </p>}
            />
            <ol className="list-decimal pl-6 space-y-1">
                <li>
                    <T
                        en={<span>Pop the OPEN node minimizing the <strong>estimated total cost</strong></span>}
                        ko={<span><strong>추정 총비용</strong>이 가장 작은 OPEN 노드를 꺼낸다</span>}
                    />
                    <BlockMath math={`\\texttt{est\\_total\\_cost} = \\texttt{past\\_cost} + \\texttt{heuristic\\_cost\\_to\\_go}`}/>
                    <T
                        en={<span>where the heuristic is an <strong>optimistic</strong> (never overestimating) guess
                            of the remaining cost, e.g., straight-line distance ignoring obstacles.</span>}
                        ko={<span>여기서 heuristic은 남은 비용의 <strong>낙관적</strong>(절대 과대평가하지 않는) 추정,
                            예컨대 장애물을 무시한 직선거리다.</span>}
                    />
                </li>
                <li>
                    <T
                        en={<span>If that node is in the goal set, reconstruct the path from parent links and stop.
                            Otherwise move it to CLOSED.</span>}
                        ko={<span>그 노드가 목표 집합에 있으면 parent 링크로 경로를 복원하고 끝낸다. 아니면 CLOSED로
                            보낸다.</span>}
                    />
                </li>
                <li>
                    <T
                        en={<span>For each neighbor not in CLOSED, if going through the current node is cheaper than
                            its best known cost, update its cost and parent and (re)insert it into OPEN. If OPEN
                            empties, there is no path.</span>}
                        ko={<span>CLOSED에 없는 각 이웃에 대해, 현재 노드를 거치는 것이 알려진 최선보다 싸면 비용과
                            parent를 갱신하고 OPEN에 (다시) 넣는다. OPEN이 비면 경로가 없는 것이다.</span>}
                    />
                </li>
            </ol>
            <T
                en={<p>
                    Why is the result optimal? When a goal node is popped its heuristic is zero, so its estimated
                    total equals its actual cost; every other OPEN node has an estimated total at least as large, and
                    since edge costs are positive and heuristics are optimistic, no future path can beat it. Setting
                    the heuristic to zero gives <strong>Dijkstra's algorithm</strong> (optimal but explores more);
                    equal edge costs reduce it further to breadth-first search; and <em>inflating</em> the heuristic
                    (multiply by <InlineMath math='\eta > 1'/>) greedily rushes toward the goal, faster but no longer
                    guaranteed optimal. The figure lets you compare all three on the same map, with the explored-cell
                    count as the scoreboard:
                </p>}
                ko={<p>
                    왜 결과가 최적일까? 목표 노드가 꺼내지는 순간 heuristic이 0이라 추정 총비용이 실제 비용과 같고,
                    다른 모든 OPEN 노드의 추정 총비용은 그 이상인데, 간선 비용이 양수이고 heuristic이 낙관적이므로
                    미래의 어떤 경로도 이를 이길 수 없다. Heuristic을 0으로 두면 <strong>Dijkstra 알고리즘</strong>
                    (최적이지만 더 많이 탐색), 간선 비용이 모두 같으면 너비 우선 탐색이 되고, heuristic을{" "}
                    <em>부풀리면</em> (<InlineMath math='\eta > 1'/> 배) 목표로 서두르는 greedy 탐색이 되어 빠르지만
                    최적 보장이 사라진다. 아래 그림에서 셋을 같은 지도에서 비교해 보라. 탐색한 셀 수가 점수판이다:
                </p>}
            />
            <GridAStar/>

            <T en={<h2>Grid Methods</h2>} ko={<h2>Grid 방법</h2>}/>
            <T
                en={<p>
                    The figure above already used the simplest discretization: an <InlineMath math='n'/>-dimensional
                    grid with <InlineMath math='k'/> points per axis. The details that matter: neighbors can be{" "}
                    <strong>4-connected</strong> or <strong>8-connected</strong> (diagonals cost{" "}
                    <InlineMath math='\sqrt 2'/>, or the integer pair 5 and 7); with axis-aligned motion the honest
                    heuristic is the <strong>Manhattan distance</strong> (city blocks), not the Euclidean one; and a
                    step is added only if it is collision-free. The result is resolution-complete and, subject to the
                    allowed motions, optimal. If many queries share one goal, a <strong>wavefront</strong> pass
                    breadth-first labels every free cell with its distance-to-goal once, after which planning from
                    anywhere is just rolling downhill. Below, wait for the wave to finish, then click any cell:
                </p>}
                ko={<p>
                    위 그림이 이미 가장 단순한 이산화를 썼다. 축마다 <InlineMath math='k'/>개 점을 둔{" "}
                    <InlineMath math='n'/>차원 grid다. 중요한 디테일들: 이웃은 <strong>4-connected</strong> 또는{" "}
                    <strong>8-connected</strong>로 잡고 (대각선 비용 <InlineMath math='\sqrt 2'/>, 정수로는 5와 7),
                    축 정렬 이동이라면 정직한 heuristic은 Euclidean이 아니라 <strong>Manhattan 거리</strong>(도시
                    블록 수)이며, 한 걸음은 충돌이 없을 때만 추가한다. 결과는 resolution-complete이고 허용된 이동
                    안에서 최적이다. 같은 목표로 질의가 많다면 <strong>wavefront</strong> 한 번으로 모든 자유 셀에
                    목표까지의 거리를 너비 우선으로 새겨 두고, 이후로는 어디서든 내리막으로 구르면 된다. 아래에서 파도가
                    다 번진 뒤 아무 칸이나 클릭해 보라:
                </p>}
            />
            <WavefrontPlanner/>
            <T
                en={<p>
                    Two extensions stretch the idea. <strong>Multi-resolution grids</strong> (quadtrees in 2D, octrees
                    in 3D) subdivide cells only near obstacles, representing the same detail with far fewer cells.
                    And <strong>motion constraints</strong> are handled by discretizing the <em>controls</em> instead
                    of the neighbors: integrate each discrete control (car steering choices, or joint-acceleration
                    grid points inside the feasible set <InlineMath math='A(q, \dot q)'/>) for a short{" "}
                    <InlineMath math='\Delta t'/>, prune nodes that land in an already-occupied cell, and search
                    Dijkstra-style. This plans directly with the car's or arm's real capabilities, at the price of
                    complexity that still grows exponentially with dimension, the fundamental reason the next section
                    exists.
                </p>}
                ko={<p>
                    두 가지 확장이 이 아이디어를 늘린다. <strong>다중 해상도 grid</strong>(2D quadtree, 3D octree)는
                    장애물 근처만 셀을 쪼개, 같은 디테일을 훨씬 적은 셀로 표현한다. <strong>운동 제약</strong>은
                    이웃 대신 <em>제어</em>를 이산화해 다룬다. 이산 제어 하나하나(자동차 조향 선택지, 또는 실현
                    가능 집합 <InlineMath math='A(q, \dot q)'/> 안의 관절 가속 grid 점)를 짧은{" "}
                    <InlineMath math='\Delta t'/> 동안 적분하고, 이미 점유된 셀에 떨어지는 노드는 쳐내며 Dijkstra
                    식으로 탐색한다. 자동차나 팔의 실제 능력 그대로 계획하는 대신, 복잡도는 여전히 차원에
                    지수적으로 자란다. 다음 절이 존재하는 근본 이유다.
                </p>}
            />

            <T en={<h2>Sampling Methods: RRT and PRM</h2>} ko={<h2>Sampling 방법: RRT와 PRM</h2>}/>
            <T
                en={<p>
                    Sampling methods trade the grid's resolution-optimality for speed in high dimensions: sample the
                    space, keep the free samples, and wire them into a tree or graph. The <strong>RRT</strong> grows a
                    tree from <InlineMath math='x_{\mathrm{start}}'/> by repeating four moves: sample{" "}
                    <InlineMath math='x_{\mathrm{samp}}'/> (nearly uniform, with a slight goal bias), find the{" "}
                    <strong>nearest</strong> tree node, <strong>steer</strong> a small step <InlineMath math='d'/>{" "}
                    toward the sample, and add the new node if the step is collision-free. Uniform samples "pull" the
                    tree into unexplored space, which is exactly what makes it rapidly exploring. Each choice hides
                    subtlety: "nearest" needs a distance metric that respects motion constraints (2 m behind a car is
                    closer, in the useful sense, than 1 m beside it), and the local planner can be a straight line,
                    discretized controls, or car-specific curves. Shake the parameters below: goal bias and step{" "}
                    <InlineMath math='d'/> reshape the RRT and its success speed, and lowering the PRM's sample count{" "}
                    <InlineMath math='N'/> or neighbor count <InlineMath math='k'/> can disconnect the roadmap
                    entirely, so the start-goal query fails:
                </p>}
                ko={<p>
                    Sampling 방법은 grid의 해상도 최적성을 내주고 고차원에서의 속도를 얻는다. 공간을 샘플하고, 자유
                    샘플만 남겨, 트리나 그래프로 엮는다. <strong>RRT</strong>는{" "}
                    <InlineMath math='x_{\mathrm{start}}'/>에서 트리를 키우는데, 네 동작을 반복한다. 샘플{" "}
                    <InlineMath math='x_{\mathrm{samp}}'/>을 뽑고 (거의 균일, 약간의 goal bias), 트리에서{" "}
                    <strong>가장 가까운</strong> 노드를 찾고, 샘플 쪽으로 작은 걸음 <InlineMath math='d'/>만큼{" "}
                    <strong>steer</strong>하고, 그 걸음이 충돌 없으면 새 노드를 더한다. 균일 샘플이 트리를 미탐색
                    공간으로 "끌어당기는" 것이 바로 rapidly exploring의 이유다. 선택마다 미묘함이 숨어 있다. "가장
                    가까움"은 운동 제약을 존중하는 거리여야 하고 (자동차 2 m 뒤가, 유용한 의미에서, 옆 1 m보다
                    가깝다), local planner는 직선, 이산 제어, 자동차 전용 곡선 등이 될 수 있다. 아래에서 파라미터를 직접 흔들어
                    보라. RRT 는 goal bias 와 걸음 크기 <InlineMath math='d'/> 에 따라 트리 모양과 성공 속도가 확
                    달라지고, PRM 은 샘플 수 <InlineMath math='N'/> 과 이웃 수 <InlineMath math='k'/> 를 줄이면
                    roadmap 이 끊겨 시작-목표 연결에 실패하는 것까지 볼 수 있다:
                </p>}
            />
            <SamplingPlanners/>
            <T
                en={<p>
                    Variants fix specific weaknesses. The <strong>bidirectional RRT</strong> grows trees from both
                    ends and joins them, reaching an exact goal state faster (though constrained systems may only
                    approximately connect, leaving a gap for smoothing to patch). <strong>RRT*</strong> keeps
                    planning after the first solution and <em>rewires</em>: each new node is connected through
                    whichever nearby node minimizes total path cost, and nearby nodes switch their parent to the new
                    node when that is cheaper, so the solution cost converges toward the optimum as samples
                    accumulate. The <strong>PRM</strong> instead precomputes an undirected <strong>roadmap</strong>{" "}
                    of <InlineMath math='\mathcal{C}_{\mathrm{free}}'/> (sample <InlineMath math='N'/> free
                    configurations, locally connect each to its <InlineMath math='k'/> nearest neighbors), and then
                    answers every query by attaching start and goal and running A*. Sampling more densely near
                    obstacles helps it thread narrow passages. Both families are probabilistically complete.
                </p>}
                ko={<p>
                    변형들이 약점을 하나씩 고친다. <strong>Bidirectional RRT</strong>는 양 끝에서 트리를 키워 잇고,
                    정확한 목표 상태에 더 빨리 닿는다 (제약이 있는 시스템은 근사적으로만 이어질 수 있어, 그 틈은
                    smoothing이 메운다). <strong>RRT*</strong>는 첫 해 이후에도 계속 계획하며 <em>rewire</em>한다.
                    새 노드는 근처 노드 중 전체 경로 비용을 최소화하는 쪽을 통해 연결되고, 근처 노드도 새 노드를
                    거치는 편이 싸면 parent를 갈아탄다. 그래서 샘플이 쌓일수록 해의 비용이 최적으로 수렴한다.{" "}
                    <strong>PRM</strong>은 대신 <InlineMath math='\mathcal{C}_{\mathrm{free}}'/>의 무방향{" "}
                    <strong>roadmap</strong>을 미리 짓는다 (자유 configuration <InlineMath math='N'/>개를 샘플하고
                    각각을 <InlineMath math='k'/> 최근접 이웃과 국소 연결). 이후 모든 질의는 시작·목표를 붙이고
                    A*를 돌리면 된다. 장애물 근처를 더 촘촘히 샘플하면 좁은 통로를 잘 꿴다. 두 계열 모두
                    probabilistically complete다.
                </p>}
            />

            <T en={<h2>Virtual Potential Fields</h2>} ko={<h2>Virtual Potential Field</h2>}/>
            <T
                en={<p>
                    Potential fields skip search entirely: build a virtual energy landscape that is low at the goal
                    and high on obstacles, and let the robot slide downhill in real time. The construction is three
                    short derivations:
                </p>}
                ko={<p>
                    Potential field는 탐색을 아예 건너뛴다. 목표에서 낮고 장애물에서 높은 가상 에너지 지형을 만들고,
                    로봇이 실시간으로 내리막을 타게 한다. 구성은 짧은 유도 셋이다:
                </p>}
            />
            <ol className="list-decimal pl-6 space-y-1">
                <li>
                    <T
                        en={<span>The goal gets a quadratic "bowl". Differentiating gives a spring-like attractive
                            force, proportional to the distance from the goal:</span>}
                        ko={<span>목표에는 이차 "그릇"을 준다. 미분하면 목표까지의 거리에 비례하는 스프링 같은
                            인력이 나온다:</span>}
                    />
                    <div className="overflow-x-auto">
                        <BlockMath math={`\\mathcal{P}_{\\mathrm{goal}}(q) = \\tfrac12 (q - q_{\\mathrm{goal}})^{\\mathsf T} K (q - q_{\\mathrm{goal}})
\\;\\;\\Longrightarrow\\;\\;
F_{\\mathrm{goal}}(q) = -\\frac{\\partial \\mathcal{P}_{\\mathrm{goal}}}{\\partial q} = K(q_{\\mathrm{goal}} - q)`}/>
                    </div>
                </li>
                <li>
                    <T
                        en={<span>Each obstacle <InlineMath math='\mathcal{B}'/> gets a repulsion that blows up as the
                            distance <InlineMath math='d(q, \mathcal{B})'/> shrinks. The chain rule through{" "}
                            <InlineMath math='d^{-2}'/> gives the force:</span>}
                        ko={<span>장애물 <InlineMath math='\mathcal{B}'/>마다 거리{" "}
                            <InlineMath math='d(q, \mathcal{B})'/>가 줄수록 치솟는 반발을 준다.{" "}
                            <InlineMath math='d^{-2}'/>를 연쇄 법칙으로 미분하면 힘이 나온다:</span>}
                    />
                    <div className="overflow-x-auto">
                        <BlockMath math={`\\mathcal{P}_{\\mathcal{B}}(q) = \\frac{k}{2\\,d^2(q, \\mathcal{B})}
\\;\\;\\Longrightarrow\\;\\;
F_{\\mathcal{B}}(q) = -\\frac{\\partial \\mathcal{P}_{\\mathcal{B}}}{\\partial q}
= \\frac{k}{d^3(q, \\mathcal{B})}\\,\\frac{\\partial d}{\\partial q}`}/>
                    </div>
                    <T
                        en={<span>In practice the potential is capped near obstacle boundaries, and obstacles beyond a
                            range of influence <InlineMath math='d_{\mathrm{range}}'/> are ignored.</span>}
                        ko={<span>실전에서는 장애물 경계 근처에서 퍼텐셜에 상한을 두고, 영향 범위{" "}
                            <InlineMath math='d_{\mathrm{range}}'/> 밖의 장애물은 무시한다.</span>}
                    />
                </li>
                <li>
                    <T
                        en={<span>Sum everything, <InlineMath math='F = F_{\mathrm{goal}} + \sum_i F_{\mathcal{B}_i}'/>,
                            and drive the robot with either a commanded force plus damping,{" "}
                            <InlineMath math='u = F(q) + B\dot q'/> (a ball rolling on the landscape with friction),
                            or a commanded velocity <InlineMath math='\dot q = F(q)'/> (no oscillation).</span>}
                        ko={<span>전부 더해 <InlineMath math='F = F_{\mathrm{goal}} + \sum_i F_{\mathcal{B}_i}'/>로
                            로봇을 몬다. 힘 + 감쇠 <InlineMath math='u = F(q) + B\dot q'/> (마찰 있는 지형 위를
                            구르는 공)로 몰거나, 속도 명령 <InlineMath math='\dot q = F(q)'/> (진동 없음)로
                            몬다.</span>}
                    />
                </li>
            </ol>
            <T
                en={<p>
                    The figure below draws the resulting landscape as a costmap over an occupancy-grid floorplan. The
                    three sliders are the whole story: raise the range of influence{" "}
                    <InlineMath math='d_{\mathrm{range}}'/> and the repulsion gain <InlineMath math='k'/> and the
                    doorway "closes", growing a brand-new local minimum in front of it; raise{" "}
                    <InlineMath math='K'/> and the robot punches through, only to be stopped short of the goal by the
                    pillar's repulsion.
                </p>}
                ko={<p>
                    아래 그림은 그 결과 지형을 occupancy grid 평면도 위 costmap 으로 그린다. 슬라이더 셋이 이야기의
                    전부다. 영향 범위 <InlineMath math='d_{\mathrm{range}}'/> 와 반발 이득 <InlineMath math='k'/> 를
                    키우면 문이 "닫히면서" 문 앞에 새 local minimum 이 자라나고, <InlineMath math='K'/> 를 키우면
                    문은 뚫지만 이번엔 기둥의 반발이 goal 직전에서 로봇을 세운다.
                </p>}
            />
            <PotentialField/>
            <T
                en={<p>
                    The trap you just experienced is the method's one deep flaw: <strong>local minima</strong>, where
                    attraction and repulsion cancel away from the goal. Escapes exist. The wavefront potential has no
                    local minima by construction. <strong>Navigation functions</strong> are smooth potentials with a
                    single minimum at the goal and nondegenerate critical points, constructible exactly on sphere
                    worlds and deformable to star-shaped obstacles. And a potential can simply serve as the
                    heuristic inside an A* search, which never gets permanently stuck. Two practical notes: when{" "}
                    <InlineMath math='d(q, \mathcal{B})'/> is hard to get, put <strong>control points</strong>{" "}
                    <InlineMath math='f_i(q)'/> on the robot, compute the easy point-to-point repulsions{" "}
                    <InlineMath math='F^{\prime}_{ij} \in \mathbb{R}^3'/>, and pull them back to joint space by
                    virtual work, <InlineMath math='F_{ij} = J_i^{\mathsf T}(q) F^{\prime}_{ij}'/>; and a wheeled
                    robot with rolling constraints <InlineMath math='A(q)\dot q = 0'/> must project the force with
                    the same projection <InlineMath math='P(q)'/> we derived for constrained dynamics in Chapter 8.
                </p>}
                ko={<p>
                    방금 겪은 함정이 이 방법의 유일하게 깊은 결함, <strong>local minimum</strong>이다. 목표가 아닌
                    곳에서 인력과 반발이 상쇄된다. 탈출구는 있다. Wavefront 퍼텐셜은 구성상 local minimum이 없다.{" "}
                    <strong>Navigation function</strong>은 목표에 유일한 최소를 갖고 임계점이 퇴화하지 않는 매끄러운
                    퍼텐셜로, sphere world에서는 정확히 만들 수 있고 별 모양 장애물로 변형해 옮길 수 있다. 또
                    퍼텐셜을 A* 탐색의 heuristic으로만 써도 되는데, 탐색은 영구히 갇히지 않는다. 실전 노트 둘.{" "}
                    <InlineMath math='d(q, \mathcal{B})'/>를 구하기 어려우면 로봇 위에{" "}
                    <strong>제어점</strong> <InlineMath math='f_i(q)'/>를 두고 쉬운 점-점 반발{" "}
                    <InlineMath math='F^{\prime}_{ij} \in \mathbb{R}^3'/>을 계산한 뒤 virtual work로 관절 공간에
                    되돌린다, <InlineMath math='F_{ij} = J_i^{\mathsf T}(q) F^{\prime}_{ij}'/>. 그리고 rolling 제약{" "}
                    <InlineMath math='A(q)\dot q = 0'/>이 있는 바퀴 로봇은 8장 constrained dynamics에서 유도한 그
                    사영 <InlineMath math='P(q)'/>로 힘을 사영해야 한다.
                </p>}
            />

            <T en={<h2>Nonlinear Optimization and Smoothing</h2>} ko={<h2>최적화와 Smoothing</h2>}/>
            <T
                en={<p>
                    Motion planning can also be posed as one big optimization:
                </p>}
                ko={<p>
                    Motion planning은 커다란 최적화 하나로도 쓸 수 있다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\begin{aligned}
\\text{find } & u(t),\\; q(t),\\; T\\\\
\\text{minimizing } & J(u(t), q(t), T)\\\\
\\text{subject to } & \\dot x = f(x, u),\\quad u(t) \\in \\mathcal{U},\\quad q(t) \\in \\mathcal{C}_{\\mathrm{free}},\\quad
x(0) = x_{\\mathrm{start}},\\quad x(T) = x_{\\mathrm{goal}}
\\end{aligned}`}/>
            </div>
            <T
                en={<p>
                    To make it finite, the histories are parametrized (polynomial or Fourier coefficients, splines,
                    piecewise-constant segments) and constraints are enforced at finitely many time points. One can
                    parametrize <InlineMath math='q(t)'/> (controls recovered from the dynamics; needs{" "}
                    <InlineMath math='m = n'/>), or <InlineMath math='u(t)'/> (state recovered by integration), or
                    both with the dynamics as explicit constraints. Gradient methods such as SQP then converge to a
                    local optimum, <em>if</em> the initial guess is close: the landscape is nonconvex, so a random
                    start can strand the optimizer far from feasibility. That is exactly why optimization shines as{" "}
                    <strong>smoothing</strong>: seed it with a planner's jerky solution and minimize, say,{" "}
                    <InlineMath math='J = \tfrac12\int_0^T \dot u^{\mathsf T}\dot u\, dt'/> to soften rapid control
                    changes. The other classic smoother is <strong>subdivide and reconnect</strong>: repeatedly try
                    to replace path segments with shorter collision-free local-planner shortcuts. Both take a plan
                    that is merely feasible and make it one a physical robot is happy to follow. Watch the two smoothers below work on the
                    same zigzag path:
                </p>}
                ko={<p>
                    유한 문제로 만들려면 이력을 매개변수화하고 (다항식·Fourier 계수, spline, 구간 상수 조각) 제약을
                    유한개의 시점에서만 강제한다. <InlineMath math='q(t)'/>를 매개변수화하거나 (제어는 동역학에서
                    복원, <InlineMath math='m = n'/> 필요), <InlineMath math='u(t)'/>를 매개변수화하거나 (상태는
                    적분으로 복원), 둘 다 하고 동역학을 명시적 제약으로 둘 수도 있다. SQP 같은 gradient 방법은 초기
                    추정이 가까울 <em>때에만</em> 국소 최적으로 수렴한다. 지형이 비볼록이라 아무 데서나 시작하면
                    실현 가능 영역에서 먼 곳에 좌초할 수 있다. 바로 그래서 최적화는 <strong>smoothing</strong>으로
                    빛난다. 플래너가 내놓은 삐걱대는 해를 씨앗으로,{" "}
                    <InlineMath math='J = \tfrac12\int_0^T \dot u^{\mathsf T}\dot u\, dt'/> 같은 비용(급격한 제어
                    변화 벌점)을 최소화한다. 다른 고전적 smoother는 <strong>subdivide and reconnect</strong>다. 경로
                    조각을 더 짧은 충돌 없는 local planner 지름길로 바꿔치기를 반복한다. 둘 다 "그저 실현 가능한"
                    계획을 실제 로봇이 기꺼이 따를 계획으로 만든다. 아래에서 두 smoother 가 같은 지그재그 경로를
                    다듬는 것을 비교해 보라:
                </p>}
            />
            <PathSmoothing/>
        </>
    )
}

export default Chapter10
