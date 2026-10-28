"""Prerequisite-graph helpers shared by the seed loader and (later) the path builder."""

from collections.abc import Hashable, Mapping, Sequence
from typing import TypeVar

K = TypeVar("K", bound=Hashable)


class CycleError(ValueError):
    pass


def topological_order(prereqs: Mapping[K, Sequence[K]]) -> list[K]:
    """Order nodes so every node comes after its prerequisites (Kahn's algorithm).

    `prereqs` maps each node to the nodes it depends on. Ties are broken by the
    input order of `prereqs`, so the result is stable for a given input.
    Raises CycleError if the graph has a cycle, KeyError if a prerequisite is unknown.
    """
    position = {node: i for i, node in enumerate(prereqs)}
    remaining = {node: len(set(deps)) for node, deps in prereqs.items()}
    dependents: dict[K, list[K]] = {node: [] for node in prereqs}
    for node, deps in prereqs.items():
        for dep in set(deps):
            if dep not in dependents:
                raise KeyError(f"{node!r} depends on unknown node {dep!r}")
            dependents[dep].append(node)

    ready = sorted((n for n, count in remaining.items() if count == 0), key=position.__getitem__)
    order: list[K] = []
    while ready:
        node = ready.pop(0)
        order.append(node)
        for child in dependents[node]:
            remaining[child] -= 1
            if remaining[child] == 0:
                ready.append(child)
        ready.sort(key=position.__getitem__)

    if len(order) != len(prereqs):
        stuck = [n for n in prereqs if n not in order]
        raise CycleError(f"prerequisite cycle among: {stuck}")
    return order
